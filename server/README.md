# Server

In this directory is the code for interacting with the database `database.py`, the directory that holds the database `database`, the code for parsing and processing all csv files in `data` (`process_data.py`), and the flask server api `open_coding`.py.

## Database Structure

[TODO: security - clean user inputs]

### options

```
option_id | option_name
```

### option_0 -> option_{option_id}

```
row_id | text | annotation
```

### labels_{option_id}

```
row_id | label
```

### label_set_{option_id}
```
label_id | label
```

## Development Instructions

Make sure Flask is installed on your computer ([Flask Installation](https://flask.palletsprojects.com/en/2.0.x/installation/#virtual-environments)).

Run the following command in the server directory to activate the flask server's virtual environment

```
$ . venv/bin/activate
```

Afterwards, run

```
$ export FLASK_APP=open_coding
$ flask run
```

Note that the flask server runs on port 5000 on your computer.


