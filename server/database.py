

from __future__ import annotations
from distutils import text_file
import sqlite3
from sqlite3 import Error

# sourced from https://www.sqlitetutorial.net/sqlite-python/create-tables/
def create_connection(db_file):
    """ create a database connection to the SQLite database
        specified by db_file
    :param db_file: database file
    :return: Connection object or None
    """
    conn = None
    try:
        conn = sqlite3.connect(db_file)
        return conn
    except Error as e:
        print(e)

    return conn


# sourced from https://www.sqlitetutorial.net/sqlite-python/create-tables/
def create_table(conn, create_table_sql):
    """ create a table from the create_table_sql statement
    :param conn: Connection object
    :param create_table_sql: a CREATE TABLE statement
    :return:
    """
    try:
        c = conn.cursor()
        c.execute(create_table_sql)
    except Error as e:
        print(e)


# sourced from https://www.sqlitetutorial.net/sqlite-python/create-tables/
def delete_table(conn, delete_table_sql):
    """ delete a table from the database
    :param conn: Connection object
    :param delete_table_sql: a DROP TABLE statement
    :return:
    """
    try:
        c = conn.cursor()
        c.execute(delete_table_sql)
    except Error as e:
        print(e)


def instantiate_tables(data_dict):
    '''
    Instatiates options, pretrained_models, and option_id table for every csv file (id) in ./data that was able to be parsed. Each
    csv file within ./data is a separate dataset option for the user.

    INPUTS: nested dictionary structure, data_dict
        data_dict = {
            table_id: {
                name: string,
                pretrained_models: [string],
                rows: {
                    row_id: {
                        text: string,
                        annotation: string
                    },
                    ...
                }
            }
            ...
        }
    OUTPUTS: None
    '''
    database = "./database/data_options.db"

    sql_data_options_table = """CREATE TABLE IF NOT EXISTS options(
                                        id INTEGER PRIMARY KEY,
                                        name TEXT NOT NULL
                                );"""

    sql_data_tables = []
    clear_sql_data_tables = []

    pretrained_data_tables = []
    clear_pretrained_data_tables = []

    for options_id in data_dict:
        sql_clear = f"DROP TABLE option_{options_id}"
        sql_data_header = f"CREATE TABLE IF NOT EXISTS option_{options_id}"
        sql_data_rest = "(id INTEGER PRIMARY KEY, text TEXT NOT NULL, annotation TEXT NOT NULL);"

        clear_sql_data_tables.append(sql_clear)
        sql_data_tables.append(sql_data_header + sql_data_rest)

        sql_clear = f"DROP TABLE pretrained_{options_id}"
        sql_data_header = f"CREATE TABLE IF NOT EXISTS pretrained_{options_id}"
        sql_data_rest = "(id INTEGER PRIMARY KEY, model TEXT NOT NULL);"

        clear_pretrained_data_tables.append(sql_clear)
        pretrained_data_tables.append(sql_data_header + sql_data_rest)

    conn = create_connection(database)

    clear_data_options_table = "DROP TABLE options"

    # if we successfully create a connection, we can perfom our actions
    if conn is not None:
        # delete pre-existing forms of table
        delete_table(conn, clear_data_options_table)

        # create options table
        create_table(conn, sql_data_options_table)

        # delete pre-existing forms of table
        for table in clear_sql_data_tables:
            delete_table(conn, table)
        for table in clear_pretrained_data_tables:
            delete_table(conn, table)

        # create each individual option's table
        for table in sql_data_tables:
            create_table(conn, table)
        for table in pretrained_data_tables:
            create_table(conn, table)

    else:
        print("Cannot establish database connection for instantiate_tables")

    conn.commit()
    conn.close()


def fill_tables(data_dict):
    '''
    Fills in the tables instantiated by instantiate_tables with the csv file's text values and empty annotations
    
    INPUTS: data_dict
        data_dict = {
            table_id: {
                name: string,
                pretrained_models: [string],
                rows: {
                    row_id: {
                        text: string,
                        annotation: string
                    },
                    ...
                }
            }
            ...
        }
    OUTPUTS: None
    '''
    database = "./database/data_options.db"
    conn = create_connection(database)

    if conn is not None:

        for options_id in data_dict:
            option_insert = f""" INSERT INTO options(id,name)
                        VALUES(?,?)
                        """
            option = (options_id,data_dict[options_id]["name"])
            conn.execute(option_insert, option)

            for i in range(0, len(data_dict[options_id]["pretrained_models"])):
                row_insert_header = f"INSERT INTO pretrained_{options_id}(id,model) VALUES(?,?)"
                row = (i,data_dict[options_id]['pretrained_models'][i])
                conn.execute(row_insert_header, row)

            for row_id in data_dict[options_id]["rows"]:
                row_insert_header = f"INSERT INTO option_{options_id}(id,text,annotation) VALUES(?,?,?)"
                row = (row_id,data_dict[options_id]['rows'][row_id]['text'],data_dict[options_id]['rows'][row_id]['annotation'])
                conn.execute(row_insert_header, row)

        conn.commit()
        conn.close()
    else:
        print("Cannot establish database connection for fill_tables")


def get_options():
    '''
    Returns dictionary of dataset options available.

    INPUTS: None
    OUPUTS: custom dictionary D
            D = {
                option_id: {
                    name: str,
                    models: [str]
                }
            }
    '''
    database = "./database/data_options.db"
    conn = create_connection(database)

    d = {}

    if conn is not None:
        option_request = f""" SELECT id, name FROM options"""
        cursor = conn.execute(option_request)
        for row in cursor:
            id, name = row
            d[id] = {
                "name": name
            }
        
        for option_id in d:
            d[option_id]["models"] = []
            pretrained_model_request = f""" SELECT id, model FROM pretrained_{option_id}"""
            cursor = conn.execute(pretrained_model_request)
            for row in cursor:
                _, model = row
                d[option_id]["models"].append(model)

        conn.close()
    else:
        print("Cannot establish database connection for get_options")

    return d


def get_option(option_id):
    '''
    Returns the name of current option selected.

    INPUTS: int
    OUTPUTS: string
    '''
    database = "./database/data_options.db"
    conn = create_connection(database)

    name = None

    if conn is not None:
        option_request = f""" SELECT id, name FROM options WHERE id = ?"""
        cursor = conn.execute(option_request, (option_id,))
        for row in cursor:
            name = row[1]
        conn.close()
    else:
        print("Cannot establish database connection for get_option")

    return name


def get_option_data(option_id):
    '''
    Returns dictionary of row content for a particular option_id.

    INPUTS: int
    OUTPUTS: custom dictionary D
            D = {
                row_id: {
                    text: str
                    annotation: str
                }
            }
    '''
    database = "./database/data_options.db"
    conn = create_connection(database)
    d = {}

    if conn is not None:

        option_request = f""" SELECT id, text, annotation FROM option_{option_id}""" 
        cursor = conn.execute(option_request)

        for row in cursor:
            id, text, annotation = row
            d[id] = {
                "text": text,
                "annotation": annotation
            }

        conn.close()

    return d


def create_constants():
    '''
    Deletes and then creates a constants_{option_id} table for that particular option_id's data.

    INPUTS: None
    OUTPUTS: None
    '''
    database = "./database/data_options.db"
    conn = create_connection(database)

    if conn is not None:
        sql_clear_1 = f"DROP TABLE constants"
        sql_data_header_1 = f"CREATE TABLE IF NOT EXISTS constants"
        sql_data_rest_1 = "(id INTEGER PRIMARY KEY, coding INTEGER NOT NULL, verification INTEGER NOT NULL, rounds INTEGER NOT NULL, batch_size INTEGER NOT NULL, num_epochs INTEGER NOT NULL, model TEXT NOT NULL);"

        delete_table(conn, sql_clear_1)
        create_table(conn, sql_data_header_1 + sql_data_rest_1)
        
        # always only one row, with id 0
        constants_insert = f"INSERT INTO constants(id,coding,verification,rounds,batch_size,num_epochs,model) VALUES(?,?,?,?,?,?,?)"
        conn.execute(constants_insert, (0, 0, 0, 0,  0, 0, ""))

        conn.commit()
        conn.close()
    else:
        print("Could not establish connection for create_constants")


def set_constants(constants, model):
    '''
    Adds in information to the constants_{option_id} table. Since the constants_{option_id} will only
    ever have one row, this overwrites pre-exising information. 

    INPUTS:
        constants: tuple of integer constants in the expected order of
            (number of open coding examples, number of verification examples per round, number of verification rounds)
        model: pretrained model directory (string)
    OUTPUTS:
        None
    '''
    database = "./database/data_options.db"
    conn = create_connection(database)

    if conn is not None:
        constants_update = f"UPDATE constants SET coding = ?, verification = ?, rounds = ?, batch_size = ?, num_epochs = ?, model = ?, WHERE id = ?"

        # id is always 0
        conn.execute(constants_update, (*constants, model, 0))
        
        conn.commit()
        conn.close()
    else:
        print("Cannot establish database connection for set_constants")


def get_constant(constant_name):
    '''
    Returns the value of a constant in the constants table, row 0

    INPUTS: string
    OUTPUTS: integer or string
    '''
    database = "./database/data_options.db"
    conn = create_connection(database)
    res = 0

    if conn is not None:
        option_request = f"""SELECT {constant_name} FROM constants WHERE id = 0""" 
        cursor = conn.execute(option_request)

        for row in cursor:
            res = row[0]
        
        conn.commit()
        conn.close()
    else:
        print("Cannot establish database connection for get_constant")

    return res


def create_labels(option_id):
    '''
    Deletes and then creates a labels_{option_id} table for that particular option_id's data.

    Additionally, deletes and then creates a label_set_{option_id} table for that particular option_id's data.

    INPUTS: int
    OUTPUTS: None
    '''
    database = "./database/data_options.db"
    conn = create_connection(database)

    if conn is not None:
        sql_clear_1 = f"DROP TABLE labels_{option_id}"
        sql_data_header_1 = f"CREATE TABLE IF NOT EXISTS labels_{option_id}"
        sql_data_rest_1 = "(id INTEGER PRIMARY KEY, label TEXT NOT NULL);"

        sql_clear_2 = f"DROP TABLE label_set_{option_id}"
        sql_data_header_2 = f"CREATE TABLE IF NOT EXISTS label_set_{option_id}"
        sql_data_rest_2 = "(id INTEGER PRIMARY KEY, label TEXT NOT NULL);"

        delete_table(conn, sql_clear_1)
        delete_table(conn, sql_clear_2)
        create_table(conn, sql_data_header_1 + sql_data_rest_1)
        create_table(conn, sql_data_header_2 + sql_data_rest_2)

        conn.commit()
        conn.close()
    else:
        print("Could not establish connection while creating labels")


def add_labels(option_id, labels):
    '''
    Adds in information to the labels_{option_id} table.

    Assumes all labels being added are not already present in the table.

    Also adds in newly-appearing labels to the label_set_{option_id} table.

    INPUTS:
        option_id: integer
        labels: iterable of tuples of (row_id: integer, label: string)
    OUTPUTS:
        None
    '''
    database = "./database/data_options.db"
    conn = create_connection(database)

    if conn is not None:
        label_insert = f"INSERT INTO labels_{option_id}(id,label) VALUES(?,?)"
        label_set_insert = f"INSERT INTO label_set_{option_id}(id,label) VALUES(?,?)"

        # gather all labels already in label_set
        # get a counter of current highest id
        label_set_gather = f""" SELECT id, label FROM label_set_{option_id}""" 
        cursor = conn.execute(label_set_gather)
        max_id = -1
        label_set = set()
        for row in cursor:
            id, label = row
            if id > max_id:
                max_id = id
            label_set.add(label)

        # pre-increment so we don't overwrite
        max_id += 1

        for elem in labels:
            row_id = elem['id']
            label = elem['label']
            labeled_row = (row_id, label)
            conn.execute(label_insert, labeled_row)

            # for every new label encountered, increment count and add to label set
            if label not in label_set:
                conn.execute(label_set_insert, (max_id, label))
                max_id += 1
                label_set.add(label)

        conn.commit()
        conn.close()
    else:
        print("Cannot establish database connection for add_labels")


def update_labels(option_id, labels):
    '''
    Updates information to the labels_{option_id} table.

    Assumes all labels being updated are present in the table, and thus
    does NOT update label_set table.

    INPUTS:
        option_id: integer
        labels: iterable of tuples of (row_id: integer, label: string)
    OUTPUTS:
        None
    '''
    database = "./database/data_options.db"
    conn = create_connection(database)

    if conn is not None:
        label_update = f"UPDATE labels_{option_id} SET label = ? WHERE id = ?"

        for row_id, label in labels:
            labeled_row = (label, row_id)
            conn.execute(label_update, labeled_row)

        conn.commit()
        conn.close()
    else:
        print("Cannot establish database connection for update_labels")

def get_label_set(option_id):
    '''
    Returns set of unique label texts.

    INPUTS: integer
    OUTPUTS: set of strings
    '''
    database = "./database/data_options.db"
    conn = create_connection(database)
    labels = []

    if conn is not None:
        option_request = f""" SELECT id, label FROM label_set_{option_id}""" 
        cursor = conn.execute(option_request)

        for row in cursor:
            id, label = row
            labels.append({'id': id, 'label': label}) # by rules of unique table ids, is a set

        conn.close()
    else:
        print("Cannot establish database connection for get_label_set")
    
    return labels


def get_label_set_data(option_id):
    '''
    Returns mapping of list of tuples of (id, label) in label_set_{option_id}

    INPUTS: integer
    OUTPUTS: list of tuples of (id: integer, label: string)
    '''
    database = "./database/data_options.db"
    conn = create_connection(database)
    labels = []

    if conn is not None:
        option_request = f""" SELECT id, label FROM label_set_{option_id}""" 
        cursor = conn.execute(option_request)

        for row in cursor:
            labels.append(row)

        conn.close()
    else:
        print("Cannot establish database connection for get_label_set")
    
    return labels


def get_labeled_data(option_id):
    '''
    Returns array of labeled text objects.

    INPUTS: integer
    OUTPUTS: array of {text: string, label: string, id: integer} objects
    '''
    database = "./database/data_options.db"
    conn = create_connection(database)
    labeled_data = []

    if conn is not None:
        label_request = f""" SELECT id, label FROM labels_{option_id}""" 
        
        cursor = conn.execute(label_request)

        for row in cursor:
            id, label = row
            text_request = f""" SELECT id, text, annotation FROM option_{option_id} WHERE id = ?"""
            info = (id,)
            inner_cursor = conn.execute(text_request, info)

            for inner_row in inner_cursor:
                _, text, _ = inner_row

                labeled_data.append({'text': text, 'label': label, 'id': id})

        conn.close()
    else:
        print("Cannot establish database connection for get_label_set")
    
    return labeled_data


def get_unlabeled_data(option_id):
    '''
    Returns array of unlabeled text objects.

    INPUTS: option_id: integer
    OUTPUTS: array of {text: string, id: integer} objects
    '''
    database = "./database/data_options.db"
    conn = create_connection(database)
    unlabeled_data = []

    if conn is not None:
        labels = set()
        label_request = f""" SELECT id, label FROM labels_{option_id}""" 
        
        cursor = conn.execute(label_request)

        for row in cursor:
            id, _ = row
            labels.add(id)
        
        text_request = f""" SELECT id, text, annotation FROM option_{option_id}"""
        cursor = conn.execute(text_request)

        for row in cursor:
            id, text, _ = row

            if id not in labels:
                unlabeled_data.append({'text': text, 'id': id})

        conn.close()
    else:
        print("Cannot establish database connection for get_label_set")
    print(f'number of unlabeled examples:', len(unlabeled_data))
    return unlabeled_data


def set_annotation_data(option_id, rows):
    '''
    Sets annotations for a particular group of rows.

    INPUTS:
        option_id: integer
        rows: tuple of (row_id: interger, annotation: string)

    OUTPUTS: None
    '''
    database = "./database/data_options.db"
    conn = create_connection(database)

    if conn is not None:
        row_insert_header = f"UPDATE option_{option_id} SET annotation = ? WHERE id = ?"

        for row_id, annotation in rows:
            annotation_row = (annotation, row_id)
            conn.execute(row_insert_header, annotation_row)

        conn.commit()
        conn.close()
    else:
        print("Cannot establish database connection for set_annotation_data")


def get_annotation_data(option_id):
    '''
    Returns a dictionary representing annotation data for any row of data under 
    option_{option_id} with a non-empty annotation field.

    INPUTS:
        option_id: integer
    OUTPUTS:
        D = {
            row_id: {
                text: string
                annotation: string
            }
        } for all entries where annotation != ""
    '''
    database = "./database/data_options.db"
    conn = create_connection(database)
    d = {}

    if conn is not None:

        option_request = f""" SELECT id, text, annotation FROM option_{option_id}""" 
        cursor = conn.execute(option_request)

        for row in cursor:
            id, text, annotation = row
            if len(annotation) > 0:
                d[id] = {
                    "text": text,
                    "annotation": annotation
                }

        conn.close()

    return d


def get_table_rows(option_id, row_ids):
    '''
    Returns a dictionary representing annotation data for all rows of row_ids under 
    option_{option_id} with a non-empty annotation field.

    INPUTS:
        option_id: integer
        row_ids: list of integers
    OUTPUTS:
        D = {
            row_id: {
                text: str
                annotation: str
            }
        } for all entries where annotation != ""
    '''
    database = "./database/data_options.db"
    conn = create_connection(database)
    d = {}

    if conn is not None:

        for id in row_ids:
            option_request = f""" SELECT id, text, annotation FROM option_{option_id} WHERE id = {id}""" 
            cursor = conn.execute(option_request)

            for row in cursor:
                id, text, annotation = row
                if len(annotation) > 0:
                    d[id] = {
                        "text": text,
                        "annotation": annotation
                    }

        conn.close()

    return d


def get_table_rows_full(option_id, row_ids):
    '''
    Returns a dictionary representing annotation data for all rows of row_ids under 
    option_{option_id}.

    INPUTS:
        option_id: integer
        row_ids: list of integers
    OUTPUTS:
        D = {
            row_id: {
                text: string
                annotation: string
            }
        } for all entries
    '''
    database = "./database/data_options.db"
    conn = create_connection(database)
    d = {}

    if conn is not None:

        for id in row_ids:
            option_request = f""" SELECT id, text, annotation FROM option_{option_id} WHERE id = {id}""" 
            cursor = conn.execute(option_request)

            for row in cursor:
                id, text, annotation = row
                d[id] = {
                    "text": text,
                    "annotation": annotation
                }

        conn.close()

    return d
    






