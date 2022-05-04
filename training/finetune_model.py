import sys
[sys.path.append(i) for i in ['.']]

import os

import torch

from transformers import DistilBertTokenizer, DistilBertModel, DistilBertConfig

# from open_coding_utils import get_model

# from open_coding_constants import model_options

# from finetune import classification_finetune, get_data_rows, get_label_id_mappings, open_coding_classification_finetune

from .open_coding_utils import get_model

from .open_coding_constants import model_options

from .finetune import classification_finetune, get_data_rows, get_label_id_mappings, open_coding_classification_finetune

os.environ["CUDA_VISIBLE_DEVICES"]="0"
# os.environ['HF_DATASETS_OFFLINE']= "1"
# os.environ['TRANSFORMERS_OFFLINE']= "1"

def finetune_model(output_filename, model, tokenizer, filename_finetune, percent_train, percent_use, max_length, num_epochs, batch_size, data_tuple):
    # finetune model based on parameters
    classification_finetune(model, tokenizer, filename_finetune, percent_train, percent_use, max_length, num_epochs, batch_size, data_tuple)
    # save finetuned model
    model_dir = './models/'

def call_finetune_model(filename, model_name, percent_train, batch_size, num_epochs):
    '''
    Call to finetune model set up for verification validation. Derives finetuning data
    from pre-labeled datasets.
    '''
    device = "cuda" if torch.cuda.is_available() else "cpu"
    # TODO: set constants
    labeled_data_dir = './labeled_data/'
    model_dir = './models/'
    percent_use = 1
    max_length = 50

    filename_finetune = labeled_data_dir + filename + '.csv'
    texts, labels = get_data_rows(filename_finetune, percent_use)
    label_id_mappings = get_label_id_mappings(labels)

    num_labels = len(label_id_mappings['id_to_label'].keys())

    output_filename = f'finetuned_{batch_size}_{num_epochs}_{percent_train}_{model_name}'

    # TODO: load model from model_filename
    # print(f"trying to get config from {model_dir + model_name}/config.json")
    config_path = model_dir + model_name + '/config.json'
    model_path = model_dir + model_name + '/'

    model = get_model('distilbert')(num_labels, config_path, model_path).to(device)
    model.update_label_id_mapping(label_id_mappings)

    tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')
    classification_finetune(model, tokenizer, filename_finetune, percent_train, percent_use, max_length, num_epochs, batch_size, (texts, labels), device, model_dir + output_filename)
    

def open_coding_finetune_model(model_name, label_id_mappings, data_tuple, percent_train, batch_size, num_epochs, no_prefix = False):
    '''
    Call to finetune model set up for open coding interface. id_to_label mappings is derived from
    database table mapping label_ids to labels. texts and labels are passed in and not derivied from
    previously-labeled examples.

    Assumes training runs on CPU.
    '''
    # TODO: set constants
    model_dir = '../training/models/'
    max_length = 50

    num_labels = len(label_id_mappings['id_to_label'].keys())

    if no_prefix:
        output_filename = model_name
    else:
        output_filename = f'open_coding_finetuned_{batch_size}_{num_epochs}_{percent_train}_{model_name}'

    # load pre-trained model or already fine-tuned model
    config_path = model_dir + model_name + '/config.json'
    model_path = model_dir + model_name + '/'

    model = get_model('distilbert')(num_labels, config_path, model_path)
    model.update_label_id_mapping(label_id_mappings)
    tokenizer = model.get_tokenizer()

    open_coding_classification_finetune(model, tokenizer, max_length, num_epochs, batch_size, data_tuple, model_dir + output_filename)

    return output_filename

def call_finetune_model_general(filename, model_name, model_type, percent_train, batch_size, num_epochs, no_prefix = False):
    '''
    Call to finetune model set up for open coding interface. id_to_label mappings is derived from
    database table mapping label_ids to labels. texts and labels are passed in and not derivied from
    previously-labeled examples.

    Raises AttributeError if model type not supported.

    Assumes training runs on CPU.
    '''
    device = "cuda" if torch.cuda.is_available() else "cpu"
    # TODO: set constants
    labeled_data_dir = './labeled_data/'
    # model_dir = './models/'
    model_dir = '/afs/csail.mit.edu/u/m/maprice/disk/maprice/models/'
    percent_use = 1
    max_length = 50

    filename_finetune = labeled_data_dir + filename + '.csv'
    texts, labels = get_data_rows(filename_finetune, percent_use)
    label_id_mappings = get_label_id_mappings(labels)

    num_labels = len(label_id_mappings['id_to_label'].keys())

    output_filename = f'finetuned_{batch_size}_{num_epochs}_{percent_train}_{model_name}'

    # config_path = f'{model_dir}{model_name}/config.json'
    # model_path = f'{model_dir}{model_name}/'

    config_path = f'{model_dir}{model_name}/model/config.json'
    model_path = f'{model_dir}{model_name}/model/'
  
    model = get_model(model_type)(num_labels, config_path, model_path).to(device)

    model.update_label_id_mapping(label_id_mappings)
    tokenizer = model.get_tokenizer()

    classification_finetune(model, tokenizer, filename_finetune, percent_train, percent_use, max_length, num_epochs, batch_size, (texts, labels), device, model_dir + output_filename)

def call_finetune_model_base(filename, model_type, percent_train, batch_size, num_epochs, no_prefix = False):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    # TODO: set constants
    labeled_data_dir = './labeled_data/'
    model_dir = '/afs/csail.mit.edu/u/m/maprice/disk/maprice/models/'
    percent_use = 1
    max_length = 50

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
            print(f'model_type: {model_name}')
            call_finetune_model_base(filename, model_name, percent_train, batch_size, num_epochs)
        else:
            # otherwise we're loading a pretrained model
            for model_type in model_options:
                if model_type in model_name:
                    print(f'model_type: {model_type}')
                    call_finetune_model_general(filename, model_name, model_type, percent_train, batch_size, num_epochs)
                    called = True
                    break

            if not called:
                raise Exception('Model Type not supported')
                # call_finetune_model(filename, model_name, percent_train, batch_size, num_epochs)
    except Exception as e:
        print(e)
        # success unreachable, TODO: delete
        # sys.argv should contain name of desired model; assume all models in specified directory
        # sys.argv also contains dataset_name, num_epochs, percent_train
        # assert len(sys.argv) - 1 == 5, 'Expecting all parameters to run this file (model_filename, dataset_name, num_epochs, percent_train, percent_use)'    
        # # some name, hdb_labeled_only.csv, some number, some decimal value <= 0 and <= 1, some decimal value <= 0 and <= 1
        # _, model_filename, dataset_name, num_epochs, percent_train, percent_use = sys.argv
        # try:
        #     num_epochs = int(num_epochs)
        #     percent_use = float(percent_use)
        #     percent_train = float(percent_train)
        #     filename_pretrain = 'happy_db.csv'
        #     filename_finetune = './../../Datasets/hdb_labeled_only.csv'
        #     max_length = 50 # TODO: should this be customizable
        #     batch_size = 1 # TODO: should this be customizable

        #     texts, labels = get_data_rows(filename_finetune, percent_use) # because these labels may not be the same set of labels before, number may not be accurate and might cause target size error. Will be fixed when all labeled data is used.
        #     label_id_mappings = get_label_id_mappings(labels)

        #     num_labels = len(label_id_mappings.keys())

        #     output_filename = f'finetuned_{num_epochs}_{percent_train}_{percent_use}_{model_filename}'

        #     # TODO: load model from model_filename
        #     model_dir = './models/'
        #     model = get_model('distilbert')(num_labels)
        #     # update to represent number of labels in finetuning set
        #     model.update_num_labels(num_labels)
        #     model.update_label_id_mapping(label_id_mappings)
        #     tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')
        #     finetune_model(output_filename, model, tokenizer, filename_finetune, percent_train, percent_use, max_length, num_epochs, batch_size, (texts, labels), label_id_mappings)
        
        # except Exception as e:
            # print(f"An exception occured: {e}")