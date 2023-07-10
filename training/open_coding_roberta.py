import torch
from torch import nn
from torch.nn import BCEWithLogitsLoss, CrossEntropyLoss

from transformers import RobertaPreTrainedModel, RobertaConfig, RobertaModel, RobertaTokenizer, logging
logging.set_verbosity_error()
from transformers.modeling_outputs import MaskedLMOutput, SequenceClassifierOutput
from transformers.activations import gelu

# uncomment these imports for local running
# from open_coding_constants import forward_types

# import style required by FLASK
from .open_coding_constants import forward_types

# Majority of code compiled directly from Source A (listed below)
# Source A: https://github.com/huggingface/transformers/blob/v4.18.0/src/transformers/models/roberta/modeling_roberta.py#L1034
class RobertaClassificationHead(nn.Module):
    """Head for sentence-level classification tasks."""

    def __init__(self, config):
        super().__init__()
        self.dense = nn.Linear(config.hidden_size, config.hidden_size)
        classifier_dropout = (
            config.classifier_dropout if config.classifier_dropout is not None else config.hidden_dropout_prob
        )
        self.dropout = nn.Dropout(classifier_dropout)
        self.out_proj = nn.Linear(config.hidden_size, config.num_labels)

    def update_num_labels(self, config):
        self.out_proj = nn.Linear(config.hidden_size, config.num_labels)

    def forward(self, features, **kwargs):
        x = features[:, 0, :]  # take <s> token (equiv. to [CLS])
        x = self.dropout(x)
        x = self.dense(x)
        x = torch.tanh(x)
        x = self.dropout(x)
        x = self.out_proj(x)
        return x

class RobertaLMHead(nn.Module):
    """Roberta Head for masked language modeling."""

    def __init__(self, config):
        super().__init__()
        self.dense = nn.Linear(config.hidden_size, config.hidden_size)
        self.layer_norm = nn.LayerNorm(config.hidden_size, eps=config.layer_norm_eps)

        self.decoder = nn.Linear(config.hidden_size, config.vocab_size)
        self.bias = nn.Parameter(torch.zeros(config.vocab_size))
        self.decoder.bias = self.bias

    def forward(self, features, **kwargs):
        x = self.dense(features)
        x = gelu(x)
        x = self.layer_norm(x)

        # project back to size of vocabulary with bias
        x = self.decoder(x)

        return x

    def _tie_weights(self):
        # To tie those two weights if they get disconnected (on TPU or when the bias is resized)
        self.bias = self.decoder.bias

class OpenCodingModel(RobertaPreTrainedModel):
    _keys_to_ignore_on_save = [r"lm_head.decoder.weight", r"lm_head.decoder.bias"]
    _keys_to_ignore_on_load_missing = [r"position_ids", r"lm_head.decoder.weight", r"lm_head.decoder.bias"]
    _keys_to_ignore_on_load_unexpected = [r"pooler"]

    def __init__(self, num_labels, config_path = None, model_path = None, tokenizer = None):
        
        if config_path is None:
            self.config = RobertaConfig.from_pretrained("roberta-base")
        else:
            self.config = RobertaConfig.from_pretrained(config_path)

        self.config.num_labels = num_labels

        super().__init__(self.config)

        if model_path is None:
            self.roberta = RobertaModel.from_pretrained("roberta-base", add_pooling_layer=False)
        else:
            self.roberta = RobertaModel.from_pretrained(model_path, config = self.config, add_pooling_layer=False)

        if tokenizer is None:
            tokenizer = RobertaTokenizer.from_pretrained("roberta-base")

        self.tokenizer = tokenizer

        # customize number of labels based on dataset
        # and prepare to set up mappings for finetuning
        self.num_labels = num_labels
        self.mappings = None

        # for classification/finetuning
        # self.roberta = RobertaModel(self.config, add_pooling_layer=False)
        self.classifier = RobertaClassificationHead(self.config)

        # for pretraining (MLM)
        self.lm_head = RobertaLMHead(self.config)
        # The LM head weights require special treatment only when they are tied with the word embeddings
        self.update_keys_to_ignore(self.config, ["lm_head.decoder.weight"])

        # Initialize weights and apply final processing
        self.post_init()
        
        # model assumes pre-training will happen first
        self.forward_type = forward_types['PRETRAIN']

    def get_tokenizer(self):
        return self.tokenizer

    def update_num_labels(self, num_labels):
        self.num_labels = num_labels
        self.config.num_labels = num_labels
        self.classifier.update_num_labels(self.config)

    def update_label_id_mapping(self, mappings):
        '''
        Mapping allows us to go from multi-class probability output to the plaintext label
        '''
        self.mappings = mappings

    def set_forward_type(self, name):
        assert name in forward_types, 'unsupported forward type'
        self.forward_type = forward_types[name]

    def get_output_embeddings(self):
        return self.lm_head.decoder

    def set_output_embeddings(self, new_embeddings):
        self.lm_head.decoder = new_embeddings

    def forward(self,
            input_ids = None,
            attention_mask = None,
            token_type_ids = None,
            position_ids = None,
            head_mask = None,
            inputs_embeds = None,
            encoder_hidden_states = None,
            encoder_attention_mask = None,
            labels = None,
            output_attentions = None,
            output_hidden_states = None,
            return_dict = None,
        ):
        if self.forward_type == forward_types['PRETRAIN']:
            return self.pretrain_forward(
                    input_ids,
                    attention_mask=attention_mask,
                    token_type_ids=token_type_ids,
                    position_ids=position_ids,
                    head_mask=head_mask,
                    inputs_embeds=inputs_embeds,
                    encoder_hidden_states=encoder_hidden_states,
                    encoder_attention_mask=encoder_attention_mask,
                    labels=labels,
                    output_attentions=output_attentions,
                    output_hidden_states=output_hidden_states,
                    return_dict=return_dict)
        else:
            return self.finetune_forward(
                    input_ids,
                    attention_mask=attention_mask,
                    token_type_ids=token_type_ids,
                    position_ids=position_ids,
                    head_mask=head_mask,
                    inputs_embeds=inputs_embeds,
                    labels=labels,
                    output_attentions=output_attentions,
                    output_hidden_states=output_hidden_states,
                    return_dict=return_dict)

    def pretrain_forward(
        self,
        input_ids = None,
        attention_mask = None,
        token_type_ids = None,
        position_ids = None,
        head_mask = None,
        inputs_embeds = None,
        encoder_hidden_states = None,
        encoder_attention_mask = None,
        labels = None,
        output_attentions = None,
        output_hidden_states = None,
        return_dict = None,
    ):
        r"""
        labels (`torch.LongTensor` of shape `(batch_size, sequence_length)`, *optional*):
            Labels for computing the masked language modeling loss. Indices should be in `[-100, 0, ...,
            config.vocab_size]` (see `input_ids` docstring) Tokens with indices set to `-100` are ignored (masked), the
            loss is only computed for the tokens with labels in `[0, ..., config.vocab_size]`
        kwargs (`Dict[str, any]`, optional, defaults to *{}*):
            Used to hide legacy arguments that have been deprecated.
        """
        return_dict = return_dict if return_dict is not None else self.config.use_return_dict

        outputs = self.roberta(
            input_ids,
            attention_mask=attention_mask,
            token_type_ids=token_type_ids,
            position_ids=position_ids,
            head_mask=head_mask,
            inputs_embeds=inputs_embeds,
            encoder_hidden_states=encoder_hidden_states,
            encoder_attention_mask=encoder_attention_mask,
            output_attentions=output_attentions,
            output_hidden_states=output_hidden_states,
            return_dict=return_dict,
        )
        sequence_output = outputs[0]
        prediction_scores = self.lm_head(sequence_output)

        masked_lm_loss = None
        if labels is not None:
            loss_fct = CrossEntropyLoss()
            masked_lm_loss = loss_fct(prediction_scores.view(-1, self.config.vocab_size), labels.view(-1))

        if not return_dict:
            output = (prediction_scores,) + outputs[2:]
            return ((masked_lm_loss,) + output) if masked_lm_loss is not None else output

        return MaskedLMOutput(
            loss=masked_lm_loss,
            logits=prediction_scores,
            hidden_states=outputs.hidden_states,
            attentions=outputs.attentions,
        )

    def finetune_forward(
            self,
            input_ids = None,
            attention_mask = None,
            token_type_ids = None,
            position_ids = None,
            head_mask = None,
            inputs_embeds = None,
            labels = None,
            output_attentions = None,
            output_hidden_states = None,
            return_dict = None,
    ):
        r"""
        labels (`torch.LongTensor` of shape `(batch_size,)`, *optional*):
            Labels for computing the sequence classification/regression loss. Indices should be in `[0, ...,
            config.num_labels - 1]`. If `config.num_labels == 1` a regression loss is computed (Mean-Square loss), If
            `config.num_labels > 1` a classification loss is computed (Cross-Entropy).
        """
        return_dict = return_dict if return_dict is not None else self.config.use_return_dict

        outputs = self.roberta(
            input_ids,
            attention_mask=attention_mask,
            token_type_ids=token_type_ids,
            position_ids=position_ids,
            head_mask=head_mask,
            inputs_embeds=inputs_embeds,
            output_attentions=output_attentions,
            output_hidden_states=output_hidden_states,
            return_dict=return_dict,
        )
        sequence_output = outputs[0]
        logits = self.classifier(sequence_output)

        # currently set up to do "multi-label" classification (but we choose just one)
        loss = None
        if labels is not None:
            loss_fct = BCEWithLogitsLoss()
            loss = loss_fct(logits, labels.float()) # result type Float can't be cast to the desired output type Long

        if not return_dict:
            output = (logits,) + outputs[2:]
            return ((loss,) + output) if loss is not None else output

        return SequenceClassifierOutput(
            loss=loss,
            logits=logits,
            hidden_states=outputs.hidden_states,
            attentions=outputs.attentions,
        )

