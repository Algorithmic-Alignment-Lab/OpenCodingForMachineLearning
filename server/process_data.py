import csv
import os

import numpy as np
import pandas as pd

import math

class ProcessingError(Exception):
    pass

def remove_suffix(input_string, suffix):
    if suffix and input_string.endswith(suffix):
        return input_string[:-len(suffix)]
    return input_string

def check_header_format(row):
    '''
    Checks format of header row. Throws ProcessingError if the format is incorrect.
    '''
    if len(row) != 2:
        raise ProcessingError("Unsupported CSV file - wrong number of columns")
    if row[0] != 'ID' or row[1] != 'TEXT':
        raise ProcessingError("Unsupported CSV file - wrong headers")


def check_title_format(row):
    '''
    Checks format of title row. Throws ProcessingError if the format is incorrect.
    '''
    if len(row) != 2:
        raise ProcessingError("Unsupported CSV file - wrong number of columns")
    if row[0] != '0':
        raise ProcessingError("ID 0 required for data name")
    

def check_row_format(row, rows):
    '''
    Checks format of non-header and non-title row. Throws ProcessingError if the format is incorrect.
    
    Returns id: integer, text: string of row if formatting is supported.
    '''
    if len(row) != 2:
        raise ProcessingError("Unsupported CSV file - wrong number of columns")
    
    id, text = row

    if not id.isdigit():
        raise ProcessingError("Unsupported ID type in CSV file")
    if id in rows:
        raise ProcessingError("Repeat ids in given csv file")

    return id, text


def parse_options_into_db():
    '''
    Searches through all csv files in ./../data and parses them into the rows needed to create a table for the local SQLLite database.
    Note that the csv files must follow the format specified in the open-coding README.

    INPUTS: None
    OUTPUTS: dictionary of tables to create D
    D = {
        table_id: {
            name: str,
            rows: {
                row_id: {
                    text: str
                    annotation: str
                },
                ...
            }
        }
        ...
    }
    '''
    path = './../data/'

    files = os.listdir(path)
    annotation_objects = {}
    table_id = 0

    for csv_file in files:
        try:
            with open(path + '/' + csv_file, 'r+', encoding="utf-8", errors='replace') as f:
                name = None
                rows = {}
                reader = csv.reader(f)
                skip_header = True
                skip_title = True
                for row in reader:
                    if skip_header:
                        check_header_format(row)
                        skip_header = False
                    elif skip_title:
                        check_title_format(row)
                        skip_title = False
                        name = row[1]
                    else:
                        id, text = check_row_format(row, rows)

                        # csv file expects 1-indexed format, but rest of codebase
                        # expects 0-indexed format
                        id = str(int(id) - 1)
                        rows[id] = {
                            "text": text,
                            "annotation": "",
                        }

                if table_id in annotation_objects:
                    raise ProcessingError("Unexpected repeat table id")

                annotation_objects[table_id] = {
                    "name": name,
                    "rows": rows
                }
            table_id += 1
        except ProcessingError as e:
            print(e) 
            print(f"did not parse the following file: {csv_file}") 
        except Exception as err:
            print(err)
            print(f"did not parse the following file: {csv_file}")         
    return annotation_objects


def find_pretrained_models(data_dict):
    '''
    Searches through all directories in ./../training/models and finds pre-trained models that correspond to each dataset option.

    INPUTS: data dictionary
    OUTPUTS: None; modifies data dictionary by adding the key "pretrained_models" mapping to an array of strings.
    D = {
        table_id: {
            name: str,
            pretrained_models: [str],
            rows: {
                row_id: {
                    text: str
                    annotation: str
                },
                ...
            }
        }
        ...
    }
    '''

    # gather all of the model names
    path = './../training/models'
    pretrained_models = set()
    pretrained_models.add('bge_classifier_base')

    directories = os.listdir(path)
    for model_dir in directories:
        if ('pretrained' in model_dir or 'base' in model_dir) and 'finetuned' not in model_dir: # don't include intermediate training models which are finetuned
            pretrained_models.add(model_dir)
    for option in data_dict:
        data_dict[option]['pretrained_models'] = []
        formatted_name = '_'.join(str.lower(data_dict[option]['name']).split(' ')) # TODO: document required pre-trained model name format

        for pretrained_model in pretrained_models:
            if formatted_name in pretrained_model or 'base' in pretrained_model:
                data_dict[option]['pretrained_models'].append(pretrained_model)


def select_some(data_arr, percent_select, number_select=None):
    '''
    Randomly selects percent_select percentage of data_arr to return. If number_select is
    provided, selects that number of items instead

    INPUTS: data_arr (1D array)
    OUTPUTS: subset of data_arr
    '''
    if number_select:
        chosen = np.random.choice(range(len(data_arr)), min(len(data_arr), number_select), replace=False)
    else:
        chosen = np.random.choice(range(len(data_arr)), math.floor(percent_select*len(data_arr)), replace=False)
    
    return [data_arr[i] for i in chosen]
                

def save_to_csv(output_filename, objects, username = "username"):
    '''
    Takes the given labeled objects and writes them to a csv file.

    INPUTS: 
        output_filename: string, desired name of saved file
        objects: array of {id: integer, text: string, label: string}
    OUTPUTS: 
        None
    '''
    path = './../results/' + username + '/'
    if not os.path.exists(remove_suffix(path, "/")):
        os.makedirs(remove_suffix(path, "/"))
        print("Made directory:" + remove_suffix(path, "/"))

    with open(path + output_filename + '.csv', 'a+') as f:
        csv_writer = csv.writer(f)

        csv_writer.writerow(('ID', 'TEXT', 'LABEL'))

        for obj in objects:
            csv_writer.writerow((obj['id'], obj['text'], obj['label']))

    return 'Finished Writing to CSV'


def write_to_csv(output_filename, objects, username = "username", first_line = True):
    '''
    Takes the given labeled objects and writes them to a csv file.

    INPUTS: 
        output_filename: string, desired name of saved file
        objects: array of {id: integer, text: string, label: string}
        first_line: boolean
    OUTPUTS: 
        None
    '''

    path = './../results/' + username + '/'
    if not os.path.exists(path.removesuffix("/")):
        os.makedirs(path.removesuffix("/"))
        print("Made directory:" + path.removesuffix("/"))

    with open(path + output_filename + '.csv', 'a+') as f:
        csv_writer = csv.writer(f)

        if first_line:
            csv_writer.writerow(('ID', 'TEXT', 'LABEL'))

        for obj in objects:
            csv_writer.writerow((obj['id'], obj['text'], obj['label']))

    return 'Finished Writing to CSV'


def write_to_csv_annotations(output_filename, objects, username = "username"):
    '''
    Takes the given annotated objects and writes them to a csv file.

    INPUTS: 
        output_filename: string, desired name of saved file
        objects: dict of id: {text: string, annotation: string}
    OUTPUTS: 
        None
    '''

    path = './../results/' + username + '/'
    if not os.path.exists(path.removesuffix("/")):
        os.makedirs(path.removesuffix("/"))
        print("Made directory:" + path.removesuffix("/"))

    with open(path + output_filename + '.csv', 'a+') as f:
        csv_writer = csv.writer(f)

        csv_writer.writerow(('ID', 'TEXT', 'ANNOTATION'))

        for obj in objects:
            csv_writer.writerow((obj, objects[obj]['text'], objects[obj]['annotation']))

    return 'Finished Writing to CSV'

def append_baseline_csv(username):

    path = "../data/"
    baseline_csv_path = 'baseline.csv'
    user_chat_csv_path = path + f'{username.upper()}_chat.csv'

    if os.path.exists(user_chat_csv_path):
        user_chat_df = pd.read_csv(user_chat_csv_path)

        if os.path.exists(baseline_csv_path):
            baseline_df = pd.read_csv(baseline_csv_path)
            baseline_df = baseline_df[1:]

            user_chat_df = pd.read_csv(user_chat_csv_path)
            user_chat_df['TEXT'][0] = username.upper() + ' COMBINED CHAT'
            user_chat_df_info = user_chat_df.iloc[:1]
            user_chat_df_text = user_chat_df.iloc[1:]


            # Assuming both CSV files have the same structure and you want to append user_chat_df to baseline_df
            combined_df = pd.concat([user_chat_df_info, baseline_df, user_chat_df_text], ignore_index=True)
            if 'ID' in combined_df.columns:
                print('renumbering combined csv IDs')
                combined_df['ID'] = range(len(combined_df))

            combined_csv_path = path + f'{username}_combined_chat.csv'
            combined_df.to_csv(combined_csv_path, index=False)

            print('Data combined successfully')
            return len(combined_df)
        else:
            print('Baseline CSV file does not exist.')
            return len(user_chat_df)
    else:
        print(user_chat_csv_path, 'file does not exist.')
        return len(0)

