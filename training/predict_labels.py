import sys
[sys.path.append(i) for i in ['.']]

import os

from transformers import DistilBertTokenizer, DistilBertModel, DistilBertConfig, logging
logging.set_verbosity_error()

# uncomment these imports for local running
# from predict import predict_labels
# from open_coding_utils import get_model
# from open_coding_constants import model_options, training_options

# import style required by FLASK
from .predict import predict_labels
from .open_coding_utils import get_model
from .open_coding_constants import model_options, training_options

os.environ['HF_DATASETS_OFFLINE']= "1"
os.environ['TRANSFORMERS_OFFLINE']= "1"

def predict(unlabeled_data, tokenizer, model, max_length):
    '''
    Uses the model and related parameters to predict labels for the unlabeled data.

    INPUTS:
        unlabeled_data: array of {text: string, id: integer} objects
        tokenizer: instance of Hugging Face PreTrainedTokenizer
        model: instance of Hugging Face PreTrainedModel
        max_length: int

    OUTPUTS: array of label objects ({id: int, text: str, label: [str]})
    '''
    predictions = predict_labels(unlabeled_data, tokenizer, model, max_length)
    return predictions


def call_predict(unlabeled_data, model_name, label_id_mapping):
    '''
    Uses the model saved under model_name to predict labels for the unlabeled data provided.

    INPUTS:
        unlabeled_data: array of {text: string, id: integer} objects
        model_name: string
        label_id_mapping: dictionary associating labels with id numbers

    OUTPUTS: array of label objects ({id: int, text: str, label: [str]})
    '''
    max_length = training_options['max_length']
    num_labels = len(label_id_mapping['id_to_label'].keys())

    model_dir = '../training/models/'
    config_path = f'{model_dir}{model_name}/config.json'
    model_path = f'{model_dir}{model_name}/'

    # NOTE: currently assuming distilbert base model because this is used by Open Coding V1.
    model = get_model('distilbert')(num_labels, config_path, model_path)
    model.update_label_id_mapping(label_id_mapping)

    tokenizer = model.get_tokenizer()
    result = predict(unlabeled_data, tokenizer, model, max_length)

    return result


def call_predict_general(unlabeled_data, model_name, label_id_mapping):
    '''
    Uses the model saved under model_name to predict labels for the unlabeled data provided.
    Can determine base model to load based on model name, and generalized for future expansions on project.

    INPUTS:
        unlabeled_data: array of {text: string, id: integer} objects
        model_name: string
        label_id_mapping: dictionary associating labels with id numbers

    OUTPUTS: array of label objects ({id: int, text: str, label: [str]})
    '''
    max_length = training_options['max_length']
    num_labels = len(label_id_mapping['id_to_label'].keys())

    model_dir = '../training/models/'

    config_path = f'{model_dir}{model_name}/config.json'
    model_path = f'{model_dir}{model_name}/'

    model = None

    for model_type in model_options:
        if model_type in model_name:
            model = get_model(model_type)(num_labels, config_path, model_path)
            break
    
    if model is None:
        raise Exception('Unsupported model type')

    tokenizer = model.get_tokenizer()
    result = predict(unlabeled_data, tokenizer, model, max_length)

    return result
