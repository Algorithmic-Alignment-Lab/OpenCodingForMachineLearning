import torch

# https://github.com/huggingface/transformers/blob/v4.17.0/src/transformers/models/distilbert/modeling_distilbert.py#L667
class MLMDataset(torch.utils.data.Dataset):
    def __init__(self, encodings):
        self.encodings = encodings

    def __getitem__(self, idx):
        return {key: val[idx].clone().detach() for key, val in self.encodings.items()}

    def __len__(self):
        return len(self.encodings.input_ids)

class PredictionDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {key: val[idx].clone().detach() for key, val in self.encodings.items()}
        item["labels"] = self.labels[idx].clone().detach()
        return item

    def __len__(self):
        return len(self.encodings.input_ids)

forward_types = {
    'PRETRAIN': 0,
    'FINETUNE': 1
} 

model_options = {'distilbert', 'roberta'}