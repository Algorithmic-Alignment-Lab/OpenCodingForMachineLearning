import sys
[sys.path.append(i) for i in ['.']]

import os

import torch

from transformers import DistilBertTokenizer, DistilBertModel, DistilBertConfig, logging
logging.set_verbosity_error()

# uncomment these imports for local running
# from open_coding_utils import get_model
# from open_coding_constants import model_options, training_options
# from finetune import classification_finetune, get_data_rows, get_label_id_mappings, open_coding_classification_finetune

# import style required by FLASK
from .open_coding_utils import get_model
from .open_coding_constants import model_options, training_options
from .finetune import classification_finetune, get_data_rows, get_label_id_mappings, open_coding_classification_finetune

os.environ["CUDA_VISIBLE_DEVICES"]="0"


def open_coding_finetune_model(model_name, label_id_mappings, data_tuple, percent_train, batch_size, num_epochs, no_prefix = False):
    '''
    Call to finetune model set up for open coding interface. id_to_label mappings is derived from
    database table mapping label_ids to labels. texts and labels are passed in and not derivied from
    previously-labeled examples.

    Assumes training runs on CPU.
    '''
    model_dir = '../training/models/'

    max_length = training_options['max_length']

    num_labels = len(label_id_mappings['id_to_label'].keys())

    # indicating that the model has been finetuned 
    if no_prefix:
        output_filename = model_name
    else:
        output_filename = f'open_coding_finetuned_{batch_size}_{num_epochs}_{percent_train}_{model_name}'

    # load pre-trained model or already fine-tuned model
    config_path = model_dir + model_name + '/model/config.json'
    model_path = model_dir + model_name + '/model/pytorch_model.bin'

    # print(f"@@@@@@@@@@@@@ DEBUG PATHS @@@@@@@@@@@@@\n"
    #       f"\tconfig_path = {config_path}\n"
    #       f"\tmodel_path = {model_path}\n"
    #       f"\tCurrent directory = {os.getcwd()}"
    #       "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n")
    
    model = get_model('distilbert')(num_labels, config_path, model_path)
    model.update_label_id_mapping(label_id_mappings)
    tokenizer = model.get_tokenizer()

    open_coding_classification_finetune(model, tokenizer, max_length, num_epochs, batch_size, data_tuple, model_dir + output_filename)

    return output_filename

def call_finetune_model_general(filename, model_name, model_type, percent_train, batch_size, num_epochs, no_prefix = False):
    '''
    Call to finetune model set up for research training purposes. id_to_label mappings is derived from
    database table mapping label_ids to labels. texts and labels are passed in and not derivied from
    previously-labeled examples.

    Raises AttributeError if model type not supported.

    Assumes training runs on CPU.
    '''
    device = "cuda" if torch.cuda.is_available() else "cpu"
    
    labeled_data_dir = './labeled_data/'
    model_dir = './models/'
    # model_dir = '/afs/csail.mit.edu/u/m/maprice/disk/maprice/models/' # TODO: remove
    
    percent_use = training_options['percent_use']
    max_length = training_options['max_length']

    filename_finetune = labeled_data_dir + filename + '.csv'
    texts, labels = get_data_rows(filename_finetune, percent_use)
    label_id_mappings = get_label_id_mappings(labels)

    num_labels = len(label_id_mappings['id_to_label'].keys())

    output_filename = f'finetuned_{batch_size}_{num_epochs}_{percent_train}_{model_name}'

    config_path = f'{model_dir}{model_name}/config.json'
    model_path = f'{model_dir}{model_name}/'

    # TODO: remove
    # config_path = f'{model_dir}{model_name}/model/config.json'
    # model_path = f'{model_dir}{model_name}/model/'
  
    model = get_model(model_type)(num_labels, config_path, model_path).to(device)

    model.update_label_id_mapping(label_id_mappings)
    tokenizer = model.get_tokenizer()

    classification_finetune(model, tokenizer, filename_finetune, percent_train, percent_use, max_length, num_epochs, batch_size, (texts, labels), device, model_dir + output_filename)

def call_finetune_model_base(filename, model_type, percent_train, batch_size, num_epochs, no_prefix = False):
    '''
    Call to finetune model set up for research training purposes; works with base models only (i.e. not pre-trained on any dataset). id_to_label mappings is derived from
    database table mapping label_ids to labels. texts and labels are passed in and not derivied from
    previously-labeled examples.

    Raises AttributeError if model type not supported.

    Assumes training runs on CPU.
    '''
    device = "cuda" if torch.cuda.is_available() else "cpu"
    
    labeled_data_dir = './labeled_data/'

    model_dir = './models/'
    # model_dir = '/afs/csail.mit.edu/u/m/maprice/disk/maprice/models/' # TODO: remove

    percent_use = training_options['percent_use']
    max_length = training_options['max_length']

    filename_finetune = labeled_data_dir + filename + '.csv'
    texts, labels = get_data_rows(filename_finetune, percent_use)
    label_id_mappings = get_label_id_mappings(labels)

    num_labels = len(label_id_mappings['id_to_label'].keys())

    output_filename = f'finetuned_{batch_size}_{num_epochs}_{percent_train}_{model_type}_base'
  
    model = get_model(model_type)(num_labels).to(device)

    model.update_label_id_mapping(label_id_mappings)
    tokenizer = model.get_tokenizer()

    classification_finetune(model, tokenizer, filename_finetune, percent_train, percent_use, max_length, num_epochs, batch_size, (texts, labels), device, model_dir + output_filename)

if __name__ == '__main__':
    try:
        assert len(sys.argv) - 1 == 5, 'Expecting all parameters to run this file (data_filename, model_filename, percent_train, batch_size, num_epochs)'
        _, filename, model_name, percent_train, batch_size, num_epochs = sys.argv
        percent_train = float(percent_train)
        batch_size = int(batch_size)
        num_epochs = int(num_epochs)
        called = False

        if model_name in model_options: # full string of type is a key means we want to load base model
            call_finetune_model_base(filename, model_name, percent_train, batch_size, num_epochs)
        else:
            # otherwise we're loading a pretrained model
            for model_type in model_options:
                if model_type in model_name:
                    call_finetune_model_general(filename, model_name, model_type, percent_train, batch_size, num_epochs)
                    called = True
                    break

            if not called:
                raise Exception('Model Type not supported')
    except Exception as e:
        print(e)