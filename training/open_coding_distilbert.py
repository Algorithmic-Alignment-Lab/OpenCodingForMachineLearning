from torch import nn
from torch.nn import BCEWithLogitsLoss

from transformers import DistilBertPreTrainedModel, DistilBertConfig, DistilBertModel, DistilBertTokenizer, logging
logging.set_verbosity_error()
from transformers.modeling_outputs import MaskedLMOutput, SequenceClassifierOutput
from transformers.activations import gelu

# uncomment these imports for local running
# from open_coding_constants import forward_types

# import style required by FLASK
from .open_coding_constants import forward_types

# Majority of code compiled directly from Sources A and B (listed below)
# Source A: https://github.com/huggingface/transformers/blob/v4.17.0/src/transformers/models/distilbert/modeling_distilbert.py#L667
# Source B: https://github.com/huggingface/transformers/tree/v4.18.0/src/transformers/models/distilbert
class OpenCodingModel(DistilBertPreTrainedModel):

    def __init__(self, num_labels, config_path = None, model_path = None, tokenizer = None):
        if config_path is None:
            self.config = DistilBertConfig.from_pretrained("distilbert-base-uncased")
        else:
            self.config = DistilBertConfig.from_pretrained(config_path)

        self.config.num_labels = num_labels

        super().__init__(self.config)

        if model_path is None:
            self.distilbert = DistilBertModel.from_pretrained("distilbert-base-uncased")
        else:
            self.distilbert = DistilBertModel.from_pretrained(model_path, config = self.config)

        if tokenizer is None:
            tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")
        self.tokenizer = tokenizer

        # for fine-tuning / label classification
        self.num_labels = num_labels
        self.mappings = None
        self.pre_classifier = nn.Linear(self.config.dim, self.config.dim)
        self.classifier = nn.Linear(self.config.dim, self.config.num_labels)
        self.dropout = nn.Dropout(self.config.seq_classif_dropout)

        # for pretraining (masked language modeling)
        self.vocab_transform = nn.Linear(self.config.dim, self.config.dim)
        self.vocab_layer_norm = nn.LayerNorm(self.config.dim, eps=1e-12)
        self.vocab_projector = nn.Linear(self.config.dim, self.config.vocab_size)
        self.mlm_loss_fct = nn.CrossEntropyLoss()

        # Initialize weights and apply final processing
        self.post_init()

        self.forward_type = forward_types['PRETRAIN']

    def get_tokenizer(self):
        return self.tokenizer

    def update_num_labels(self, num_labels):
        self.num_labels = num_labels
        self.classifier = nn.Linear(self.config.dim, num_labels)

    def update_label_id_mapping(self, mappings):
        '''
        Mapping allows us to go from multi-class probability output to the plaintext label.
        '''
        self.mappings = mappings

    def set_forward_type(self, name):
        assert name in forward_types, 'unsupported forward type'
        self.forward_type = forward_types[name]

    def get_position_embeddings(self) -> nn.Embedding:
        """
        Returns the position embeddings.
        """
        return self.distilbert.get_position_embeddings()

    def resize_position_embeddings(self, new_num_position_embeddings: int):
        """
        Resizes position embeddings of the model if `new_num_position_embeddings != config.max_position_embeddings`.
        Arguments:
            new_num_position_embeddings (`int`):
                The number of new position embedding matrix. If position embeddings are learned, increasing the size
                will add newly initialized vectors at the end, whereas reducing the size will remove vectors from the
                end. If position embeddings are not learned (*e.g.* sinusoidal position embeddings), increasing the
                size will add correct vectors at the end following the position encoding algorithm, whereas reducing
                the size will remove vectors from the end.
        """
        self.distilbert.resize_position_embeddings(new_num_position_embeddings)

    def get_output_embeddings(self):
        return self.vocab_projector

    def set_output_embeddings(self, new_embeddings):
        self.vocab_projector = new_embeddings

    def forward(self,
        input_ids=None,
        attention_mask=None,
        head_mask=None,
        inputs_embeds=None,
        labels=None,
        output_attentions=None,
        output_hidden_states=None,
        return_dict=None
        ):
        if self.forward_type == forward_types['PRETRAIN']:
            return self.pretrain_forward(
                    input_ids,
                    attention_mask,
                    head_mask,
                    inputs_embeds,
                    labels,
                    output_attentions,
                    output_hidden_states,
                    return_dict)
        else:
            return self.finetune_forward(
                    input_ids,
                    attention_mask,
                    head_mask,
                    inputs_embeds,
                    labels,
                    output_attentions,
                    output_hidden_states,
                    return_dict)

    def pretrain_forward(
        self,
        input_ids=None,
        attention_mask=None,
        head_mask=None,
        inputs_embeds=None,
        labels=None,
        output_attentions=None,
        output_hidden_states=None,
        return_dict=None
    ):
        return_dict = return_dict if return_dict is not None else self.config.use_return_dict

        dlbrt_output = self.distilbert(
            input_ids=input_ids,
            attention_mask=attention_mask,
            head_mask=head_mask,
            inputs_embeds=inputs_embeds,
            output_attentions=output_attentions,
            output_hidden_states=output_hidden_states,
            return_dict=return_dict,
        )
        hidden_states = dlbrt_output[0]  # (bs, seq_length, dim)
        prediction_logits = self.vocab_transform(hidden_states)  # (bs, seq_length, dim)
        prediction_logits = gelu(prediction_logits)  # (bs, seq_length, dim)
        prediction_logits = self.vocab_layer_norm(prediction_logits)  # (bs, seq_length, dim)
        prediction_logits = self.vocab_projector(prediction_logits)  # (bs, seq_length, vocab_size)

        mlm_loss = None
        if labels is not None:
            mlm_loss = self.mlm_loss_fct(prediction_logits.view(-1, prediction_logits.size(-1)), labels.view(-1))

        if not return_dict:
            output = (prediction_logits,) + dlbrt_output[1:]
            return ((mlm_loss,) + output) if mlm_loss is not None else output

        return MaskedLMOutput(
                loss=mlm_loss,
                logits=prediction_logits,
                hidden_states=dlbrt_output.hidden_states,
                attentions=dlbrt_output.attentions)
    
    def finetune_forward(
        self,
        input_ids=None,
        attention_mask=None,
        head_mask=None,
        inputs_embeds=None,
        labels=None,
        output_attentions=None,
        output_hidden_states=None,
        return_dict=None,
    ):
        return_dict = return_dict if return_dict is not None else self.config.use_return_dict

        distilbert_output = self.distilbert(
            input_ids=input_ids,
            attention_mask=attention_mask,
            head_mask=head_mask,
            inputs_embeds=inputs_embeds,
            output_attentions=output_attentions,
            output_hidden_states=output_hidden_states,
            return_dict=return_dict,
        )
        hidden_state = distilbert_output[0]  # (bs, seq_len, dim)
        pooled_output = hidden_state[:, 0]  # (bs, dim)
        pooled_output = self.pre_classifier(pooled_output)  # (bs, dim)
        pooled_output = nn.ReLU()(pooled_output)  # (bs, dim)
        pooled_output = self.dropout(pooled_output)  # (bs, dim)
        logits = self.classifier(pooled_output)  # (bs, num_labels)

        # we're only doing multi-class classification
        # TODO: consider https://medium.com/dejunhuang/learning-day-57-practical-5-loss-function-crossentropyloss-vs-bceloss-in-pytorch-softmax-vs-bd866c8a0d23
        loss = None
        if labels is not None:
            loss_fct = BCEWithLogitsLoss() # TODO: should this be cross entropy
            loss = loss_fct(logits, labels.float()) # result type Float can't be cast to the desired output type Long

        if not return_dict:
            output = (logits,) + distilbert_output[1:]
            return ((loss,) + output) if loss is not None else output

        return SequenceClassifierOutput(
            loss=loss,
            logits=logits,
            hidden_states=distilbert_output.hidden_states,
            attentions=distilbert_output.attentions,
        )