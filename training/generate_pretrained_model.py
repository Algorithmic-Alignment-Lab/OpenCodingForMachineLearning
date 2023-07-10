import sys

import torch
from transformers import DistilBertTokenizer, logging
logging.set_verbosity_error()
import os

# import style required by FLASK
from .pretrain import mlm_pretrain, save_base_model
from .open_coding_utils import get_model
from .open_coding_constants import training_options

# uncomment these imports for local running
# from pretrain import mlm_pretrain, save_base_model
# from open_coding_utils import get_model
# from open_coding_constants import training_options

os.environ["CUDA_VISIBLE_DEVICES"]="0"


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
    
    percent_pretrain = training_options['percent_pretrain']
    mask_percentage = training_options['mask_percentage']
    max_length = training_options['max_length']

    output_path_filename = f'models/{data_filename}_pretrained_{batch_size}_{num_epochs}'
    filename = f'{data_filename}.csv'
    try:
        # trains and saves the model into "models"
        mlm_pretrain(model, tokenizer, filename, output_path_filename, mask_percentage, max_length, percent_pretrain, num_epochs, batch_size, device)
    except Exception as e:
        print(e)


def save_base_model_general(model_type):
    '''
    Saves base version of model_type (no pretraining on dataset) for verification purposes.

    INPUTS:
        model_type: string
    
    OUTPUTS: None
    '''
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = get_model(model_type)(0).to(device)
    # output_filename = f'models/open_coding_base_{model_type}'
    # for server disk access, TODO: remove
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

    model = get_model(model_type)(0).to(device)
    tokenizer = model.get_tokenizer()

    percent_pretrain = training_options['percent_pretrain']
    mask_percentage = training_options['mask_percentage']
    max_length = training_options['max_length']

    # output_path_filename = f'models/{data_filename}_pretrained_{model_type}_{batch_size}_{num_epochs}'
    # for server disk access TODO: remove
    output_path_filename = f'/afs/csail.mit.edu/u/m/maprice/disk/maprice/models/{data_filename}_pretrained_{model_type}_{batch_size}_{num_epochs}'
    filename = f'{data_filename}.csv'
    try:
        # trains and saves the model into "models"
        mlm_pretrain(model, tokenizer, filename, output_path_filename, mask_percentage, max_length, percent_pretrain, num_epochs, batch_size, device)
    except Exception as e:
        print(e)

def call_pretrain_model_distilbert_local(data_filename, batch_size, num_epochs, input_path, output_path):
    '''
    Pretrains an OpenCoding model on a given dataset using the Distilbert Transformers model type.
    Version curated for first edition of Open Coding interface, which only uses distilbert models. 

    INPUTS:
        data_filename: str, csv data to pretrain model with. Expects no file specifier type ({data_filename}.csv)
        batch_size: int
        num_epochs: int
        input_path: string
        output_path: string
    OUTPUTS:
        String name of saved model's directory, in the form {data_filename}_pretrained_{batch_size}_{num_epochs}.
        Model is saved under /models.
    '''
    device = "cuda" if torch.cuda.is_available() else "cpu"

    model = get_model('distilbert')(0).to(device)
    tokenizer = model.get_tokenizer()

    percent_pretrain = training_options['percent_pretrain']
    mask_percentage = training_options['mask_percentage']
    max_length = training_options['max_length']

    output_path_filename = output_path + f'{data_filename}_pretrained_{batch_size}_{num_epochs}'
    input_filename = f'{data_filename}.csv'

    try:
        # trains and saves the model into "models"
        mlm_pretrain(model, tokenizer, input_filename, output_path_filename, mask_percentage, max_length, percent_pretrain, num_epochs, batch_size, input_path)
        return f'{data_filename}_pretrained_{batch_size}_{num_epochs}'
    except Exception as e:
        print(e)


if __name__ == '__main__':
    try: # wrap in try/except to prevent the failure of successive attempts in terminal runs
        if len(sys.argv) == 2:
            _, model_type = sys.argv
            save_base_model_general(model_type)
        else:
            assert len(sys.argv) == 5, 'Expecting all parameters to run this file (model_type, dataset_name, batch_size, and num_epochs)'
            model_type, data_filename, batch_size, num_epochs = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
            call_pretrain_model_general(model_type, data_filename, batch_size, num_epochs) 
    except Exception as e:
        print(e)