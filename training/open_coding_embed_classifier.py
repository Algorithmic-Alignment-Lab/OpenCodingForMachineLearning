from typing import Optional, Tuple

import torch
from torch import nn
from torch.nn import CrossEntropyLoss

class OpenCodingModel(nn.Module):

    def __init__(self, num_labels, embed_size=1024, p_dropout=0.8):
        super(OpenCodingModel, self).__init__()
        # for fine-tuning / label classification
        self.embed_size = embed_size
        self.num_labels = num_labels
        self.p_dropout = p_dropout
        self.classifier = nn.Sequential(
            nn.Dropout(self.p_dropout),
            nn.Linear(self.embed_size, self.embed_size),
            nn.ReLU(),
            nn.Linear(self.embed_size, self.num_labels, bias=False)
            )

    def update_num_labels(self, num_labels):
        '''
        Update the number of labels you want the classifier to predict.
        '''
        self.num_labels = num_labels
        self.classifier = nn.Sequential(
            nn.Dropout(self.p_dropout),
            nn.Linear(self.embed_size, self.embed_size),
            nn.ReLU(),
            nn.Linear(self.embed_size, self.num_labels, bias=False)
            )

    def update_label_id_mapping(self, mappings):
        '''
        Mapping allows us to go from multi-class probability output to the plaintext label.
        '''
        self.mappings = mappings

    def update_embed_size(self, embed_size):
        '''
        Update the embedding size obtained from API. bge-large-en-v1.5 has dimension 1024.
        '''
        self.embed_size = embed_size

    def forward(self,
        input_features: torch.LongTensor = None,
        labels: Optional[torch.LongTensor] = None,
    )-> Tuple:

        hidden_states = input_features
        logits = self.classifier(hidden_states)

        loss = None
        if labels is not None:
            labels = labels.to(logits.device)

        loss_fct = CrossEntropyLoss()
        loss = loss_fct(logits.view(-1, self.num_labels), labels.view(-1))
                
        output = (logits,) 
        return ((loss,) + output) if loss is not None else output