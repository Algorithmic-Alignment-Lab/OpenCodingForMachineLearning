# Server

In this directory is the code for interacting with the database (`database.py`), the directory that holds the database (`database`), the code for parsing and processing all csv files in `data` (`process_data.py`), and the flask server api (`open_coding.py`).

## Database Structure

### options

```
option_id | option_name
```

### option_0 -> option_{option_id}

```
row_id | text | annotation
```

### option_0 -> pretrained_{option_id}
```
row_id | model
```

### labels_{option_id}

```
row_id | label
```

### label_set_{option_id}

```
label_id | label
```

### constants

```
0 | number of open coding examples | number of predictions per verification round | minimum number of verification rounds
```

## Development Instructions

First, make sure Flask is installed on your computer ([Flask Installation](https://flask.palletsprojects.com/en/2.0.x/installation/#virtual-environments)).

Next, we need to create a virtual environment for the flask server to run in.

Within the server directory, run:

```
$ python3 -m venv venv
```

Then, activate the virtual environment by running:

```
$ . venv/bin/activate
```

When you'd like to exit this virtual environment, you can use the command `deactivate`.

Next, we need to install all of the server's required dependencies within our virtual environment.

Run the following commands:

```
$ pip install Flask
$ pip install numpy
$ pip install torch
$ pip install simpletransformers
```
> **_NOTE_** 
> 
> If you have an M1 machine, the installation of `simpletransformers` will likely fail. 
> In this case, try the following:
> ```
> $ arch -arm64 brew install cmake
> $ pip install --no-cache-dir sentencepiece
> ```
> and
> ```
> $ brew install rustup
> $ rustup-init
> $ source ~/.cargo/env
> $ rustc --version
> $ pip install tokenizers
> $ pip install simpletransformers
> ```
> Unfortunately this installation might take a big of debugging if the above is insufficient.
>

Now that the dependencies are installed, run

```
$ export FLASK_APP=open_coding
$ export FLASK_RUN_PORT=8000
$ flask run
```

Note that the flask server runs on port 8000 on your computer. You should be able to navigate to http://127.0.0.1:8000 and get a test response once `flask run` has fully loaded.


