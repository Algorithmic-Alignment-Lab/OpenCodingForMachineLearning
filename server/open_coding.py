import sys

from click import option
[sys.path.append(i) for i in ['..']]

from flask import Flask, json, request

app = Flask(__name__)

from process_data import parse_options_into_db, select_some, save_to_csv, write_to_csv, write_to_csv_annotations
from database import instantiate_tables, fill_tables, get_options, get_option, get_option_data, set_annotation_data, get_annotation_data, add_labels, update_labels, get_label_set, get_table_rows_full, get_table_rows, get_labeled_data, get_unlabeled_data, get_label_set_data, create_labels

from training.finetune_model import open_coding_finetune_model

from training.predict_labels import call_predict

@app.route('/', methods=['GET'])
def test():
    response = {
        "body": "welcome to the OpenCodingForMachineLearning Flask Server"
    }

    add_options(response)
    return json.jsonify(response)

# @app.route('/data/happydb', methods=['GET'])
# def happy_db():
#     print("happy db")
#     response = {
#         "body": "inside happy db"
#     }

#     add_options(response)
#     return json.jsonify(response)

@app.route('/data/prep_data', methods=['GET'])
def prep_data():
    '''
    A request to grab all csv files, and load the information into the database
    '''
    data_dict = parse_options_into_db()
    print(f"data dictionary options: {list(data_dict.keys())}")
    instantiate_tables(data_dict)
    fill_tables(data_dict)

    response = {
        "body": "ok"
    }

    add_options(response)
    return json.jsonify(response)
    

@app.route('/data/get_all_data_options', methods=['GET'])
def get_all_data_options():
    options = get_options()

    response = {
        "names": [options[option]["name"] for option in options],
        "options": options
    }

    add_options(response)
    return json.jsonify(response)

@app.route('/data/get_data_option', methods=['GET'])
def get_data_option():
    option_id = request.args.get("id")
    max_request_size = 50 # TODO: adjust constant
    options = get_option_data(option_id)
    create_labels(option_id)
    option_ids = list(options.keys())
    selected_ids = select_some(option_ids, 0, max_request_size)

    parsed_options = []
    for id in selected_ids:
            parsed_options.append({"id": int(id), "text": options[id]["text"], "annotation": options[id]["annotation"]})

    response = {
        "rows": parsed_options
    }

    add_options(response)
    return json.jsonify(response)

# TODO: function call to initiate pre-training of model
# then it can run in the backgrouond while the  user annotates and labels
# can set a state in App.js

# TODO: pushing back annotations
@app.route('/data/save_annotations', methods=['POST'])
def save_annotations():
    response = {}
    add_options(response)
    content_type = request.headers.get('Content-Type')
    if (content_type == 'application/json'):
        json_data = request.get_json()

        rows = json_data['rows']
        option_id = json_data['id']

        set_annotation_data(option_id, rows)
        
        response['msg'] = 'Success'
    else:
        response['msg'] = 'Content-Type not supported!'
        response['ok'] = False
    
    return json.jsonify(response)

@app.route('/data/get_annotations', methods=['GET'])
def get_annotations():
    option_id = request.args.get("id")
    annotations = get_annotation_data(option_id)

    parsed_options = []
    for id in annotations:
        parsed_options.append({"id": int(id), "text": annotations[id]["text"], "annotation": annotations[id]["annotation"]})

    print("annotations found:", parsed_options)
    response = {
        "rows": parsed_options
    }

    add_options(response)
    return json.jsonify(response)


@app.route('/data/save_labels', methods=['POST'])
def save_labels():
    response = {}
    add_options(response)
    content_type = request.headers.get('Content-Type')
    if (content_type == 'application/json'):
        json_data = request.get_json()

        rows = json_data['rows']
        option_id = json_data['id']

        add_labels(option_id, rows)
        response['msg'] = 'Success'
    else:
        response['msg'] = 'Content-Type not supported!'
        response['ok'] = False

    return json.jsonify(response)

@app.route('/data/get_label_set', methods=['GET'])
def get_label_set_req():
    option_id = request.args.get("id")
    label_set = get_label_set(option_id)

    response = {
        "rows": label_set
    }

    add_options(response)
    return json.jsonify(response)

@app.route('/data/update_labels', methods=['POST'])
def update_labels_req():
    response = {}
    add_options(response)
    content_type = request.headers.get('Content-Type')
    if (content_type == 'application/json'):
        json_data = request.get_json()

        rows = json_data['rows']
        option_id = json_data['id']

        update_labels(option_id, rows)
        response['msg'] = 'Success'
    else:
        response['msg'] = 'Content-Type not supported!'
        response['ok'] = False

    return json.jsonify(response)

@app.route('/data/train_and_predict', methods=['POST'])
def train_and_predict():
    response = {}
    add_options(response)
    content_type = request.headers.get('Content-Type')
    if (content_type == 'application/json'):
        json_data = request.get_json()

        rows = json_data['rows']
        option_id = json_data['id']

        # save these labels
        add_labels(option_id, rows)

        # get their row ids in order to build up required data rows
        row_ids = [row['id'] for row in rows]
        text_objs = get_table_rows_full(option_id, row_ids)
        print(f'I found these text objects:', text_objs)
        data_rows = [{'text': text_objs[elem['id']]['text'], 'id': elem['id'], 'label': elem['label']} for elem in rows]

        # grab which model we're going to use in order to support successive training (efficiency)
        model_type = json_data['model']
        model_name = 'happy_db_pretrained_50_5' if (model_type == 0) else 'open_coding_finetuned_1_1_1_' + 'happy_db_pretrained_50_5'
        
        percent_train = 1 # always use entire set to train
        # TODO: set constants
        batch_size = 1
        num_epochs = 1

        # gather label_id_mappings
        id_label_tuples = get_label_set_data(option_id)
        label_id_mappings = {
            'id_to_label': {},
            'label_to_id': {}
        }
        for id, label in id_label_tuples:
            label_id_mappings['id_to_label'][id] = label
            label_id_mappings['label_to_id'][label] = id

        # finetune the model, return output filepath
        # TODO: support multiple labels per row_id (would require large structural change; row_id -> multiple strings?)
        # call with no prefix based on model type
        output_name = open_coding_finetune_model(model_name, label_id_mappings, ([d['text'] for d in data_rows], [d['label'] for d in data_rows]), percent_train, batch_size, num_epochs, (model_type != 0))
        
        # will be saved at the following 
        # gather all unlabeled texts
        unlabeled_data = get_unlabeled_data(option_id)

         # randomly select given percentage/number of examples
        # TODO: set constants
        percent_guess = 0.03
        number_guess = 50
        selected_unlabeled_data = select_some(unlabeled_data, percent_guess, number_guess)

        # make predictions, return [{id, text, labels}]
        predictions = call_predict(selected_unlabeled_data, output_name, label_id_mappings)

        response["labeled"] = predictions
        response['msg'] = 'Success'
    else:
        response['msg'] = 'Content-Type not supported!'
        response['ok'] = False

    return json.jsonify(response)

@app.route('/data/get_verification_data', methods=['GET'])
def get_verification_data():
    option_id = request.args.get("id")

    # get all currently labeled data
    # TODO: should I succesively train or always freshly train?
    data_rows = get_labeled_data(option_id)
    print(f'verification labeled data: {data_rows}')
    # select the model to finetune
    # TODO: successive saving, pulling
    # TODO: make modular, gather model name from saved database name
    model_name = 'happy_db_pretrained_50_5'
    percent_train = 1 # always use entire set to train
    # TODO: set constants
    batch_size = 1
    num_epochs = 1

    # gather label_id_mappings
    id_label_tuples = get_label_set_data(option_id)
    label_id_mappings = {
        'id_to_label': {},
        'label_to_id': {}
    }
    for id, label in id_label_tuples:
        label_id_mappings['id_to_label'][id] = label
        label_id_mappings['label_to_id'][label] = id

    # finetune the model, return output filepath
    # TODO: support multiple labels per row_id (would require large structural change; row_id -> multiple strings?)
    output_name = open_coding_finetune_model(model_name, label_id_mappings, ([d['text'] for d in data_rows], [d['label'] for d in data_rows]), percent_train, batch_size, num_epochs)

    # gather all unlabeled texts
    unlabeled_data = get_unlabeled_data(option_id)

    # randomly select given percentage/number of examples
    # TODO: set constants
    percent_guess = 0.03
    number_guess = 50
    selected_unlabeled_data = select_some(unlabeled_data, percent_guess, number_guess)

    # make predictions, return [{id, text, labels}], we DON'T save these (only save to dataset after user confirmation)
    predictions = call_predict(selected_unlabeled_data, output_name, label_id_mappings)

    response = {
        "labeled": predictions
    }

    add_options(response)
    return json.jsonify(response)

@app.route('/data/get_results', methods=['GET'])
def get_results():
    option_id = request.args.get("id")
    kerb = 'demo'

    data_rows = get_labeled_data(option_id)
    model_name = 'happy_db_pretrained_50_5'
    percent_train = 1 # always use entire set to train
    # TODO: set constants
    batch_size = 1
    num_epochs = 1

    # gather label_id_mappings
    id_label_tuples = get_label_set_data(option_id)
    label_id_mappings = {
        'id_to_label': {},
        'label_to_id': {}
    }
    for id, label in id_label_tuples:
        label_id_mappings['id_to_label'][id] = label
        label_id_mappings['label_to_id'][label] = id

    # finetune the model, return output filepath
    # todo - set model name with no prefix
    output_name = open_coding_finetune_model(model_name, label_id_mappings, ([d['text'] for d in data_rows], [d['label'] for d in data_rows]), percent_train, batch_size, num_epochs)
    name = get_option(option_id).replace(' ', '_')

    write_to_csv(kerb + '_labeled_' + name, data_rows)

    # gather all unlabeled texts, and predict
    unlabeled_data = get_unlabeled_data(option_id)

    while unlabeled_data != []:

        some_selected_data = select_some(unlabeled_data, 0, 200)

        # make predictions, return [{id, text, label}]
        predictions = call_predict(some_selected_data, output_name, label_id_mappings)

        # add all labels to db
        add_labels(option_id, predictions)
        # incrementally update results file
        write_to_csv(kerb + '_labeled_' + name, predictions, False)

        # loop again
        unlabeled_data = get_unlabeled_data(option_id)

    # also save what was annotation
    annotations = get_annotation_data(option_id)
    
    write_to_csv_annotations(kerb + '_annotations_' + name, annotations)

    response = {
        "saved": kerb + '_labeled_' + name,
        "model name": output_name,
    }

    add_options(response)
    return json.jsonify(response)


def add_options(response):
    response["headers"] = {"content-type": "application/json"},
    response["ok"] = True
    return response