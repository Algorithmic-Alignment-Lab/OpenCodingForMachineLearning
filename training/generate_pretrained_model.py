import sys

import torch

from pretrain import mlm_pretrain, save_base_model

from transformers import DistilBertTokenizer
from open_coding_utils import get_model

import os

os.environ["CUDA_VISIBLE_DEVICES"]="0"

def pretrain_model(model, tokenizer, filename_pretrain, mask_percentage, max_length, percent_pretrain, num_epochs, batch_size):
    output_path_filename = f'models/happydb_pretrained_{batch_size}_{num_epochs}'
    # pretrain the model based on the specified parameters
    mlm_pretrain(model, tokenizer, filename_pretrain, mask_percentage, max_length, percent_pretrain, num_epochs, batch_size)

def call_pretrain_model(data_filename, batch_size, num_epochs):
    '''
    Pretrains a DistilBertOpenCoding model on a given dataset using a supported Transformers model type.

    INPUTS:
        data_filename: str, csv data to pretrain model with. Expects no file specifier type ({data_filename}.csv)
        batch_size: int
        num_epochs: int
    OUTPUTS:
        None. Saves pretrained model to models/{data_filename}_pretrained_{batch_size}_{num_epochs}
    '''
    device = "cuda" if torch.cuda.is_available() else "cpu"

    model = get_model('distilbert')(0).to(device)
    tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')
    # TODO: organize constants
    percent_pretrain = 1.0
    mask_percentage = 0.15
    max_length = 50
    # output_dir = './models/'
    output_path_filename = f'models/{data_filename}_pretrained_{batch_size}_{num_epochs}'
    filename = f'{data_filename}.csv'
    try:
        # trains and saves the model into "models"
        mlm_pretrain(model, tokenizer, filename, output_path_filename, mask_percentage, max_length, percent_pretrain, num_epochs, batch_size, device)
    except Exception as e:
        print(e)

def save_base_model_general(model_type):
    '''
    Saves base version of model_type (no pretraining) for verification purposes.
    '''
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = get_model(model_type)(0).to(device)
    # output_filename = f'models/open_coding_base_{model_type}'
    # for server disk access
    output_filename = f'/afs/csail.mit.edu/u/m/maprice/disk/maprice/models/open_coding_base_{model_type}'

    save_base_model(model, output_filename)


def call_pretrain_model_general(model_type, data_filename, batch_size, num_epochs):
    '''
    Pretrains an OpenCoding model on a given dataset using a supported Transformers model type.

    INPUTS:
        model_type: str, child of open_coding_utils.model_options
        data_filename: str, csv data to pretrain model with. Expects no file specifier type ({data_filename}.csv)
        batch_size: int
        num_epochs: int
    OUTPUTS:
        None. Saves pretrained model to models/{data_filename}_pretrained_{model_type}_{batch_size}_{num_epochs}
    '''
    device = "cuda" if torch.cuda.is_available() else "cpu"

    # model = get_specialized_open_coding_model(model_type, 0)
    model = get_model(model_type)(0).to(device)
    # model = model.to(device)
    tokenizer = model.get_tokenizer()

    # TODO: organize constants
    percent_pretrain = 1
    mask_percentage = 0.15
    max_length = 50

    # output_path_filename = f'models/{data_filename}_pretrained_{model_type}_{batch_size}_{num_epochs}'
    # for server disk access
    output_path_filename = f'/afs/csail.mit.edu/u/m/maprice/disk/maprice/models/{data_filename}_pretrained_{model_type}_{batch_size}_{num_epochs}'
    filename = f'{data_filename}.csv'
    try:
        # trains and saves the model into "models"
        mlm_pretrain(model, tokenizer, filename, output_path_filename, mask_percentage, max_length, percent_pretrain, num_epochs, batch_size, device)
    except Exception as e:
        print(e)

if __name__ == '__main__':

    # TODO: remove support for this option
    # if len(sys.argv) == 4:
    #     data_filename, batch_size, num_epochs = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
    #     call_pretrain_model(data_filename, batch_size, num_epochs) 
    try: # wrap in try/except to prevent the failure of successive attempts in terminal runs
        if len(sys.argv) == 2:
            _, model_type = sys.argv
            save_base_model_general(model_type)
        else:
            assert len(sys.argv) == 5, 'Expecting all parameters to run this file (model_Type, dataset_name, batch_size, and num_epochs)'
            model_type, data_filename, batch_size, num_epochs = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
            call_pretrain_model_general(model_type, data_filename, batch_size, num_epochs) 
    except Exception as e:
        print(e)
    # else:
    #     # sys.argv should contain output model name, to be saved in standard directory
    #     # sys.argv also contains dataset_name, num_epochs, mask_percentage, percent_pretrain
    #     assert len(sys.argv) - 1 == 5, 'Expecting all parameters to run this file (output_filename, dataset_name, num_epochs, mask_percentage, and percent_pretrain)'
    #     # some name, happy_db.csv, some number, some decimal value <= 0 and <= 1, some decimal value <= 0 and <= 1, some decimal value <= 0 and <= 1
    #     _, output_filename, dataset_name, num_epochs, mask_percentage, percent_pretrain = sys.argv

    #     try:
    #         num_epochs = int(num_epochs)
    #         mask_percentage = float(mask_percentage)
    #         percent_pretrain = float(percent_pretrain)

    #         filename_pretrain = 'happy_db.csv'
    #         max_length = 50 # TODO: should this be customizable
    #         batch_size = 1 # TODO: should this be customizable
    #         model = get_model('distilbert')(0)
    #         tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')

    #         pretrain_model(model, tokenizer, dataset_name, mask_percentage, max_length, percent_pretrain, num_epochs, batch_size)

    #     except Exception as e:
    #         print(f"An exception occured: {e}")