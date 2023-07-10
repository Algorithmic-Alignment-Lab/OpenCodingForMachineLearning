import csv

import math 
import os

import numpy as np
from transformers import Trainer, TrainingArguments, logging
logging.set_verbosity_error()
import torch

# import style required by FLASK
from .open_coding_constants import MLMDataset

# uncomment these imports for local running
# from open_coding_constants import MLMDataset

# constants representing special tokens
CLS = 101
SEP = 102
MASK = 103
PAD = 0

# prevents automatic weights and biases logging
os.environ["WANDB_DISABLED"] = "true"
os.environ["CUDA_VISIBLE_DEVICES"]="0"

def generate_masked(texts, tokenizer, mask_percentage, max_length, device="cpu"):
    '''
    Returns inputs dictionary with mask_percentage of text hidden.

    Replaces mask_percentage of input ids with mask token and stores
    original input ids in labels.

    INPUTS: 
        text: str
        tokenizer: transformers tokenizer
        mask_percentage: amount of text to mask

    OUTPUTS: inputs dictionary
    '''
    def assign_to_device(inputs):
        '''
        Assigns required elements of input to the given device.

        INPUTS:
            inputs: tensor

        OUTPUTS: None
        '''
        send_to_device = {"input_ids", "attention_mask", "labels", "token_type_ids"}

        for key, val in inputs.items():
            if key in send_to_device:
                inputs[key] = val.to(device)

    # Guided by https://towardsdatascience.com/masked-language-modelling-with-bert-7d49793e5d2c
    inputs = tokenizer(texts, return_tensors='pt', max_length=max_length, truncation=True, padding = True)
    inputs['labels'] = inputs.input_ids.detach().clone()

    # create random array of floats in equal dimension to input_ids
    rand = torch.rand(inputs.input_ids.shape)

    # array is true where value < mask_percentage and NOT [CLS] or [SEP] or [PAD]
    mask_arr = (rand < mask_percentage) * (inputs.input_ids != CLS) * (inputs.input_ids != SEP) * (inputs.input_ids != PAD)
    
    selection = []

    for i in range(inputs.input_ids.shape[0]):
        selection.append(torch.flatten(mask_arr[i].nonzero()).tolist())
    
    for i in range(inputs.input_ids.shape[0]):
        inputs.input_ids[i, selection[i]] = MASK
    
    assign_to_device(inputs)

    return inputs


def preprocess_data_for_mlm(filename, tokenizer, mask_percentage, max_length, percent_elems_mask, data_dir):
    '''
    Prepares csv file for masked language modeling (pre-training).

    INPUTS: 
        filename: str name of csv file to pre-process in ./../data. 
        tokenizer: instance of Hugging Face PreTrainedTokenizer
        mask_percentage: float, percentage of each text to mask
        max_length: integer, maximum size per piece of text
        percent_elems_mask: float, percentage of dataset to preprocess for mlm

    OUTPUT: 
      inputs: tokenized dictionary for mlm model training, size: number of examples for pretraining
    '''

    texts = []

    with open(data_dir + filename, 'r+') as f:
        reader = csv.reader(f)
        skip_header = True
        skip_name = True

        for row in reader:
            # we don't need the header or the "0,NAME" rows
            if skip_header:
                skip_header = False
                continue
            elif skip_name:
                skip_name = False
                continue
            else:
                _, text = row

                # remove extraneous quotes
                text = text.strip("\"")
                texts.append(text)

    pretrain_num = math.floor(len(texts)*percent_elems_mask)
    subset_texts = np.random.choice(texts,pretrain_num)
    inputs = generate_masked(list(subset_texts), tokenizer, mask_percentage, max_length)
    return inputs, pretrain_num


def mlm_pretrain(model, tokenizer, filename, output_path_filename, mask_percentage, max_length, percent_elems_mask=.2, num_epochs=1, batch_size=4, path='./data/'):
    '''
    Pretrains distilbert model on given text objects via masked language modeling. 

    Assumes model has subtype 'ForMaskedLM'

    INPUTS: 
        model: "ForMaskedLM" type model
        tokenizer: corresponding tokenizer for the model given
        text_objects: set of strings

    OUTPUTS:
        model, pretrained on given text_objects
    '''
    model.set_forward_type("PRETRAIN")
    inputs, _ = preprocess_data_for_mlm(filename, tokenizer, mask_percentage, max_length, percent_elems_mask, path)
    dataset = MLMDataset(inputs)

    args = TrainingArguments(
        output_dir =output_path_filename + '/outputs',
        logging_dir=output_path_filename + '/logs',
        per_device_train_batch_size=batch_size,
        num_train_epochs=num_epochs,
        # save_total_limit=1, # only save best checkpoint; remove disk quota
        use_mps_device=True # fixing `Placeholder storage has not been allocated on MPS device!`
    )

    trainer = Trainer(
        model=model,
        args=args,
        train_dataset=dataset
    )

    trainer.train()
    trainer.save_model(output_path_filename + '/model')


def save_base_model(model, output_path_filename):
    '''
    Saves model at specified output filepath
    '''
    model.save_pretrained(output_path_filename + '/model')
