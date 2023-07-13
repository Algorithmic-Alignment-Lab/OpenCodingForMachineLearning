import csv
import json
import os
import warnings

import numpy as np

import math

class ProcessingError(Exception):
    pass


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


def parse_annotation_data(annotations):
    # param comes from annotations = get_annotation_data(option_id)

    parsed_options = []
    for id in annotations:
        parsed_options.append({"id": int(id), "text": annotations[id]["text"], "annotation": annotations[id]["annotation"]})

    return parsed_options


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

    directories = os.listdir(path)
    for model_dir in directories:
        if 'pretrained' in model_dir and 'finetuned' not in model_dir: # don't include intermediate training models which are finetuned
            pretrained_models.add(model_dir)

    for option in data_dict:
        data_dict[option]['pretrained_models'] = []

        formatted_name = '_'.join(str.lower(data_dict[option]['name']).split(' ')) # TODO: document required pre-trained model name format

        for pretrained_model in pretrained_models:
            if formatted_name in pretrained_model:
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
                

def save_to_csv(output_filename, objects):
    '''
    Takes the given labeled objects and writes them to a csv file.

    INPUTS: 
        output_filename: string, desired name of saved file
        objects: array of {id: integer, text: string, label: string}
    OUTPUTS: 
        None
    '''

    path = './../results/'

    with open(path + output_filename + '.csv', 'a+') as f:
        csv_writer = csv.writer(f)

        csv_writer.writerow(('ID', 'TEXT', 'LABEL'))

        for obj in objects:
            csv_writer.writerow((obj['id'], obj['text'], obj['label']))

    return 'Finished Writing to CSV'


# instead of changing the above which seems to be for a very specific format
# I will just utilize my own
def custom_save_to_csv(output_filename, objects, field_names):
    path = './../results/'
    csv_path = path + output_filename + '.csv'
    write_header = False
    if not os.path.exists(csv_path):
        write_header = True
        
    with open(csv_path, 'a+') as f:
        csv_dict_writer = csv.DictWriter(f=f, fieldnames=field_names)
        if write_header:
            csv_dict_writer.writeheader()
        
        # iterate through the objects they provided and make sure they have the fields specified
        for obj in objects:
            row = {}
            for field in field_names:
                if field not in obj:
                    warnings.warn(f"JSON/Dict object missing a field `{field}`" + 
                                  f"\n\tobject: {obj}")
                row[field] = obj.get(field)
                
            csv_dict_writer.writerow(row)
    
    return "Finished writing object using custom save_to_csv"


def write_to_csv(output_filename, objects, first_line = True):
    '''
    Takes the given labeled objects and writes them to a csv file.

    INPUTS: 
        output_filename: string, desired name of saved file
        objects: array of {id: integer, text: string, label: string}
        first_line: boolean
    OUTPUTS: 
        None
    '''

    path = './../results/'

    with open(path + output_filename + '.csv', 'a+') as f:
        csv_writer = csv.writer(f)

        if first_line:
            csv_writer.writerow(('ID', 'TEXT', 'LABEL'))

        for obj in objects:
            csv_writer.writerow((obj['id'], obj['text'], obj['label']))

    return 'Finished Writing to CSV'


def write_to_csv_annotations(output_filename, objects):
    '''
    Takes the given annotated objects and writes them to a csv file.

    INPUTS: 
        output_filename: string, desired name of saved file
        objects: dict of id: {text: string, annotation: string}
    OUTPUTS: 
        None
    '''

    path = './../results/'

    with open(path + output_filename + '.csv', 'a+') as f:
        csv_writer = csv.writer(f)

        csv_writer.writerow(('ID', 'TEXT', 'ANNOTATION'))

        for obj in objects:
            csv_writer.writerow((obj, objects[obj]['text'], objects[obj]['annotation']))

    return 'Finished Writing to CSV'


def load_csv_to_json_object(csv_file_path, 
                            field_names=('ID', 'TEXT', 'ANNOTATION')):
    
    assert os.path.exists(csv_file_path), \
        f"Unable to load to json object from NONEXISTENT csv file: " \
        f"{csv_file_path}"
    
    csv_dict_rows_list = []
    with open(csv_file_path, 'r') as csv_file:
        reader = csv.DictReader(f=csv_file, fieldnames=field_names)
        next(reader)  # skip the header
        for row in reader:
            # mui requires id be in lowercase
            row_copy = dict(row)
            if not row_copy.get("ID") and not row_copy.get("id"):
                raise KeyError("Expected ID or id from csv row (since mui requires unique ids)."
                               f"\nSaw row = {row}")
            if row_copy.get("ID"):
                del row_copy["ID"]
                row_copy["id"] = row["ID"]
                
            csv_dict_rows_list.append(row_copy)
    
    # removed dumps because
    # dumps convert the results into a string
    # but I meant to just have it be an object
    # the main call to this function should be able to encode it enough
    return csv_dict_rows_list


def get_label_counts(labels_list, key_to_check="annotation"):
    """
    Count how many of each label there is

    :param labels_list: the result of what we read from the csv file
    :type labels_list: list of dictionaries (csv Dict)
    
    :raises KeyError: if our assumption that you have the ANNOTATION key
    is not met (i.e. you modified the save format somewhere 
    or load format from load_csv_to_json)
    
    :return: each label and their corresponding count
    :rtype: dict
    """
    label_counts = {}
    for row in labels_list:
        # accept either upper or lower case
        if not row.get(key_to_check.upper()) and not row.get(key_to_check):
            raise KeyError("Unable to count how many there are of each label.\n"
                           f"Expected 'ANNOTATION' key. Got row = {row}")

        current_label = row.get(key_to_check) if key_to_check in row else row.get(key_to_check.upper())
        if current_label not in label_counts:
            label_counts[current_label] = 1
        else:
            label_counts[current_label] += 1
            
    return label_counts


def sort_label_counts(label_counts_dict):
    """
    Place the {label: count} pairs in descending order
    So that we can display it nicely in a table later

    :param label_counts_dict: the result from get_label_counts 
    :type label_counts_dict: dict ({label: count, ...})
    :return: (reversed) {count: label, ... } pairs in descending order
    :rtype: list of dictionaries
    """
    counts_dict = {} # reverse the key value pairing for easier sorting
    for label_key in label_counts_dict:
        count = label_counts_dict[label_key]
        # handle potential duplicate counts
        if count not in counts_dict:
            counts_dict[count] = [label_key]
        else:
            counts_dict[count].append(label_key)
    
    # place the {label: count} pairs here based on the count order
    sorted_label_counts = []
    while counts_dict:
        curr_max_count = max(list(counts_dict.keys()))
        labels_with_that_count = sorted(counts_dict[curr_max_count])
        
        # don't forget about the possible duplicate counts
        sorted_label_counts.append({labels_with_that_count[0]: curr_max_count})
        for label in labels_with_that_count[1:]:  
            sorted_label_counts.append({label: curr_max_count})
            
        del counts_dict[curr_max_count]
        
    return sorted_label_counts


def tableify_label_statistics(sorted_label_counts_list, 
                          total_label_count):
    """
    Convert the list of {label: count} pairs to something we can display in a mui table easily

    :param sorted_label_counts_dict: the result from sort_label_counts
    :type sorted_label_counts_dict: list of dictionaries [{label: count}, ...]
    
    :param total_label_count: the total number of labels
    :type total_label_count: int
    
    :return: table rows (each with the designated columns below)
    :rtype: list of dictionaries
    """
    ID_KEY = "id"
    LABEL_KEY = "label"
    COUNT_KEY = "count"
    PERCENT_KEY = "percent"
    label_counts_table_list = []
        
    # extracting each key and count from our sorted list of format
    # [{label: count}, {label:count}, ...]
    id = 1
    for label_and_count_dict in sorted_label_counts_list:
        curr_label = list(label_and_count_dict.keys())[0]
        curr_count = label_and_count_dict[curr_label]
        label_counts_table_list.append({
            ID_KEY: id,
            LABEL_KEY: curr_label,
            COUNT_KEY: curr_count,
            PERCENT_KEY: curr_count / total_label_count
        })
        id += 1 # have the ids generated here so mui will be happy
    
    # no need to return the columns, 
    # we have to have them in the mui format anyway (GridColDef)
    return label_counts_table_list


def get_summary_rows(labels_list, key_to_check="annotation"):
    
    total_final_labels = len(labels_list)
    # get summary statistics about that overall set of labels
    model_label_counts = get_label_counts(labels_list, key_to_check)
    sorted_model_label_counts = sort_label_counts(model_label_counts)
    stats_rows  = tableify_label_statistics(
        sorted_model_label_counts, total_final_labels
    )
    return stats_rows