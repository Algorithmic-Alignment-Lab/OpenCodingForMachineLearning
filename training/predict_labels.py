# plot graph of # of labels vs model performance, base model vs fine tuned model
# plot graph of # of labels vs model training time, base model vs fine tuned model
# performance vs training time
# https://seaborn.pydata.org/#:~:text=Seaborn%20is%20a%20Python%20data,introductory%20notes%20or%20the%20paper.
# - pretty formatting of existing matplotlib code via 'import seaborn'

import sys
[sys.path.append(i) for i in ['.']]

import os

from transformers import DistilBertTokenizer, DistilBertModel, DistilBertConfig

# uncomment these imports for local running
# from predict import predict_labels
# from open_coding_utils import get_model
# from open_coding_constants import model_options

# import style required by FLASK
from .predict import predict_labels
from .open_coding_utils import get_model
from .open_coding_constants import model_options

os.environ['HF_DATASETS_OFFLINE']= "1"
os.environ['TRANSFORMERS_OFFLINE']= "1"

def predict(unlabeled_data, tokenizer, model, max_length):
    predictions = predict_labels(unlabeled_data, tokenizer, model, max_length)
    return predictions

def call_predict(unlabeled_data, model_name, label_id_mapping):
    # TODO: set constants
    max_length = 50
    num_labels = len(label_id_mapping['id_to_label'].keys())
    print('num_labels: ', num_labels)

    model_dir = '../training/models/'
    # config = DistilBertConfig.from_pretrained(model_dir + model_name + '/config.json')
    # distilbert_model = DistilBertModel.from_pretrained(model_dir + model_name + '/', config = config)
    config_path = f'{model_dir}{model_name}/config.json'
    model_path = f'{model_dir}{model_name}/'

    model = get_model('distilbert')(num_labels, config_path, model_path)
    model.update_label_id_mapping(label_id_mapping)

    tokenizer = model.get_tokenizer()
    result = predict(unlabeled_data, tokenizer, model, max_length)

    return result

def call_predict_general(unlabeled_data, model_name, label_id_mapping):
    # TODO: set constants
    max_length = 50
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
        raise Exception('Unsuppoted model')

    tokenizer = model.get_tokenizer()
    result = predict(unlabeled_data, tokenizer, model, max_length)

    return result


if __name__ == "__main__":
    test_data = [
        {'text': 'hello my name is', 'id': 0},
        {'text': 'what is your name', 'id': 1},
    ]

    results = call_predict(test_data)

    print(results)