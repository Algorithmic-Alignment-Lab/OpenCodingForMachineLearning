import logging
import sys

[sys.path.append(i) for i in ['.']]
import csv

import math 

import os

import numpy as np

from transformers import Trainer, TrainingArguments, logging
logging.set_verbosity_error()

import torch

# uncomment these imports for local running
# from open_coding_constants import PredictionDataset

# import style required by FLASK
from .open_coding_constants import PredictionDataset

# prevents automatic weights and biases logging
os.environ["WANDB_DISABLED"] = "true"

def generate_tokenized(texts, labels, tokenizer, max_length, device="cpu"):
    '''
    Tokenizes texts and labels for predictive modeling.

    INPUTS: 
        texts: 2D array of strings
        labels: 2D array of floats
        tokenizer: instance of Hugging Face PreTrainedTokenizer
        max_length: integer
        device: string, default "cpu"

    OUTPUTS: tuple of tensors
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

    inputs = tokenizer(texts, return_tensors='pt', max_length=max_length, truncation=True, padding = True)
    input_labels = torch.tensor(labels)
    assign_to_device(inputs)
    return inputs, input_labels


def get_data_rows(filename, percent_use, data_arr = None):
    '''
    Randomly chooses a specified percentage of the dataset's rows.

    INPUTS:
        filename: string
        percent_use: float
        data_arr: data to chose from, overrides filename. Defaults to None.

    OUTPUTS: tuple of string array, string array
    '''
    data_dir = ''
    texts = []
    labels = []

    if data_arr != None:

        for dict_obj in data_arr:
            texts.append(dict_obj['text'])
            labels.append(dict_obj['label'])

    else:
        # open ouput and filter
        with open(data_dir + filename, 'r+') as f:
            reader = csv.reader(f)
            skip_header = True

            for row in reader:
                # we don't need the header or the "0,NAME" rows
                if skip_header:
                    skip_header = False
                    continue
                else:
                    _, text, label = row

                    # remove extraneous quotes
                    text = text.strip("\"")
                    texts.append(text)

                    # turn into valid english word
                    label.replace('_', ' ')
                    labels.append(label)

    chosen_indices = np.random.choice(range(len(texts)), math.floor(percent_use*len(texts)), replace=False)
    return [texts[i] for i in chosen_indices], [labels[i] for i in chosen_indices]


def get_label_id_mappings(labels):
    '''
    Given all of the labels in the selected portion of the dataset, returns dictionary with two mappings,
    label to index, and index to label. These mappings represent the same multi-label classifier output by 
    the classification linear layer.

    INPUTS: array of strings

    OUTPUTS: dictionary with two keys, 'label_to_id' and 'id_to_label'. The former maps string to integer and the latter maps
            integer to string.
    '''
    all_labels = set(labels)

    label_to_id = {}
    id_to_label = {}
    i = 0
    for label in all_labels:
        label_to_id[label] = i
        id_to_label[i] = label
        i+=1

    return {
        'id_to_label': id_to_label,
        'label_to_id': label_to_id,
    }


def get_train_test(filename, percent_train, percent_use, data_tuple = None):
    '''
    Randomly delegates percent_train of data (which is of a size determined by percent_use) as training data,
    and the rest as testing data.

    INPUTS:
        filename: str data source
        percent_train: float
        percent_use: float
        data_tuple: tuple of list, list if the data has already been defined

    OUPUTS:
        dictionary
    '''
    if data_tuple:
        data, labels = data_tuple
    else:
        data, labels = get_data_rows(filename, percent_use, None)

    train_indices = np.random.choice(range(len(data)), round(percent_train*len(data)), replace=False)
    test_indices = [j for j in range(len(data)) if j not in train_indices]

    train_subset = [data[j] for j in train_indices]
    train_subset_labels = [labels[j] for j in train_indices]

    test_subset = [data[j] for j in test_indices]
    test_subset_labels = [labels[j] for j in test_indices]

    print(f'size finetuning train: {len(train_subset)}; size finetuning test: {len(test_subset)}')

    return {
        'train_data': train_subset,
        'train_labels': train_subset_labels,
        'test_data': test_subset,
        'test_labels': test_subset_labels
    }


def convert_labels(labels, label_mapping):
    '''
    Converts an array of labels into the respective 2D float array representation, where
    each index of a label represents a float array of label weights.

    INPUTS:
        labels: array of strings
        label_mapping: dictionary

    OUTPUTS: 2D float array
    '''
    converted = []
    # each label is an array of probabilities for each possible label type
    for label in labels:
        inner_list = [0 for _ in label_mapping['id_to_label'].keys()]
        for l_i in label_mapping['id_to_label']:
            if label_mapping['id_to_label'][l_i] == label:
                inner_list[l_i] = 1 # assume one label classification for now. TODO: update
        converted.append(inner_list)
    return converted


def preprocess_data_for_classification(filename, percent_train, percent_use, tokenizer, max_length, data_tuple = None, label_mapping=None, device="cpu"):
    '''
    Prepares csv file for label classification.

    INPUTS: 
        filename: str name of csv file to pre-process in ./../data. 
        tokenizer: transformers tokenizer

    OUTPUT: 
      dictionary of PredictionDataset for training, PredictionDataset for testing, and label id mappings.
    '''
    train_test = get_train_test(filename, percent_train, percent_use, data_tuple)

    train_labels_txt = train_test['train_labels']
    test_labels_txt = train_test['test_labels']

    if label_mapping is None:
        print('no label mapping')
        label_mapping = get_label_id_mappings(train_labels_txt + test_labels_txt)

    train_data = train_test['train_data']
    test_data = train_test['test_data']
    
    train_labels = []
    test_labels = []

    # each label is an array of probabilities for each possible label type
    for label in train_labels_txt:
        inner_list = [0 for _ in label_mapping['id_to_label'].keys()]
        for l_i in label_mapping['id_to_label']:
            if label_mapping['id_to_label'][l_i] == label:
                inner_list[l_i] = 1
        train_labels.append(inner_list)

    for label in test_labels_txt:
        inner_list = [0 for _ in label_mapping['id_to_label'].keys()]
        for l_i in label_mapping['id_to_label']:
            if label_mapping['id_to_label'][l_i] == label:
                inner_list[l_i] = 1 # only single class for now
        test_labels.append(inner_list)

    train_d, train_l =  generate_tokenized(train_data, train_labels, tokenizer, max_length, device)
    test_d, test_l = generate_tokenized(test_data, test_labels, tokenizer, max_length, device)

    return {
        'train': PredictionDataset(train_d, train_l),
        'test': PredictionDataset(test_d, test_l),
        'id_to_label': label_mapping['id_to_label'], # TODO: remove mutable access
        'label_to_id': label_mapping['label_to_id']
    }


def classification_finetune(model, tokenizer, filename, percent_train, percent_use, max_length, num_epochs=1, batch_size=4, data_tuple=None, device="cpu", output_filename=None):
    '''
    Finetunes the given model using the data specified by filename, unless data_tuple != None. Designed for
    use for research testing. 

    INPUTS:
        model: instance of Hugging Face PreTrainedModel
        tokenizer: instance of Hugging Face PreTrainedTokenizer
        filename: string
        percent_train: float
        percent_use: float
        max_length: integer
        num_epochs: integer
        batch_size: integer
        data_tuple: tuple of string, string (text, labels)
        device: string
        output_filename: string

    OUTPUTS: dictionary of PredictionDataset for training, PredictionDataset for testing, and label id mappings
    '''
    model.set_forward_type("FINETUNE")
    mapping = model.mappings
    dataset = preprocess_data_for_classification(filename, percent_train, percent_use, tokenizer, max_length, data_tuple, mapping, device)

    args = TrainingArguments(
        output_dir=output_filename + '/outputs',
        logging_dir=output_filename + '/logs',
        per_device_eval_batch_size=batch_size,
        per_device_train_batch_size=batch_size,
        num_train_epochs=num_epochs,
        dataloader_pin_memory=False,
        use_mps_device=True
    )

    trainer = Trainer(
        model=model,
        args=args,
        train_dataset=dataset["train"],
        eval_dataset=dataset["test"]
    )

    result = trainer.train()
    metrics = trainer.evaluate()
    write_finetune_results(output_filename, result, metrics)

    return dataset


def classification_finetune_happy_db_subsets(model, tokenizer, filename, percent_train, percent_use, max_length, num_epochs=1, batch_size=4, data_tuple=None, device="cpu", output_filename = None):
    '''
    Finetunes the given model using the data specified by filename, unless data_tuple != None. Calls helper function
    for writing results in subset form. Designed for use for research testing. 

    INPUTS:
        model: instance of Hugging Face PreTrainedModel
        tokenizer: instance of Hugging Face PreTrainedTokenizer
        filename: string
        percent_train: float
        percent_use: float
        max_length: integer
        num_epochs: integer
        batch_size: integer
        data_tuple: tuple of string, string (text, labels)
        device: string
        output_filename: string

    OUTPUTS: dictionary of PredictionDataset for training, PredictionDataset for testing, and label id mappings
    '''
    model.set_forward_type("FINETUNE")
    mapping = model.mappings
    dataset = preprocess_data_for_classification(filename, percent_train, percent_use, tokenizer, max_length, data_tuple, mapping, device)

    args = TrainingArguments(
        output_dir=output_filename + '/outputs',
        logging_dir= output_filename + '/logs',
        per_device_eval_batch_size=batch_size,
        per_device_train_batch_size=batch_size,
        num_train_epochs=num_epochs,
        # save_total_limit=1, # only save best checkpoint; remove disk quota
        dataloader_pin_memory=False,
        use_mps_device=True
    )

    trainer = Trainer(
        model=model,
        args=args,
        train_dataset=dataset["train"],
        eval_dataset=dataset["test"]
    )

    result = trainer.train()
    metrics = trainer.evaluate()
    write_subset_results(output_filename + '/results.csv', result, metrics, percent_train)

    return dataset

def open_coding_classification_finetune(model, tokenizer, max_length, num_epochs, batch_size, data_tuple, output_filename):
    '''
    Finetuning tailored to the needs of Open Coding. Data is always passed through using the data_tuple, and CPU is always used.

    INPUTS:
        model: instance of Hugging Face PreTrainedModel
        tokenizer: instance of Hugging Face PreTrainedTokenizer
        max_length: integer
        num_epochs: integer
        batch_size: integer
        data_tuple: tuple of string, string (text, labels)
        output_filename: string

    OUTPUTS: string
    '''
    texts, labels = data_tuple
    model.set_forward_type("FINETUNE")
    mapping = model.mappings

    converted_labels = convert_labels(labels, mapping)
    # found problem: it's because I didn't run train then get label set like verification did.
    # print("""
    #       @@@@@@@@ DEBUG @@@@@@@@@
    #       labels: {}
    #       mapping: {}
    #       converted_labels: {} [THIS IS THE PROBLEM RETURN]
    #       @@@@@@@@@@@@@@@@@@@@@@@@
    #       """.format(labels, mapping, converted_labels))
    inputs, input_labels = generate_tokenized(texts, converted_labels, tokenizer, max_length)

    train_data = PredictionDataset(inputs, input_labels)

    args = TrainingArguments(
        output_dir='outputs',
        per_device_train_batch_size=batch_size,
        num_train_epochs=num_epochs,
        save_total_limit=1, # only save best checkpoint; remove disk quota
        dataloader_pin_memory=False,
        use_mps_device=True
    )

    trainer = Trainer(
        model=model,
        args=args,
        train_dataset=train_data,
    )

    trainer.train()
    # terminal view results
    # can access model again later
    trainer.save_model(output_filename)
    return 'Completed Training'


def write_finetune_results(output_filename, result, metrics):
    '''
    Writes results of finetuning session to the logs.

    INPUTS:
        output_filename: string, information about the finetuned run
        result: dictionary
        metrics: dictionary
    OUTPUTS: None
    '''
    filename = '/finetuning_logs.txt'
    with open(output_filename + filename, 'a+') as f:
        f.write('--------------\n')
        f.write(f'train_loss: {result.training_loss}\n')
        f.write(f'eval_loss: {metrics["eval_loss"]}\n')
        f.write(f'train_time: {result.metrics["train_runtime"]}\n')
        f.close()
    

def write_subset_results(output_filename, result, metrics, percent_train):
    '''
    Writes results of finetuning session to the logs, in subset-desired form.

    INPUTS:
        output_filename: string, information about the finetuned run
        result: dictionary
        metrics: dictionary
        precent_train: float
    OUTPUTS: None
    '''
    with open(output_filename, 'a+') as f:
        f.write(f'{percent_train},{metrics["eval_loss"]},{result.training_loss}\n')
        f.close()