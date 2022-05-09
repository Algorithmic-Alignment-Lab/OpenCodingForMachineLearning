# Open Coding for Machine Learning

An annotation interface that allows a single annotator to efficiently and effectively devise labels and descriptions for a large, unlabeled dataset. The interface follows the coding techniques listed in Constructing Grounded Theory, while scaling the techniques with DistilBERT classifiers.

This interface requires the installation of npm [MacOS example](https://changelog.com/posts/install-node-js-with-homebrew-on-os-x). 

This interface also requires the installation of [Flask](https://flask.palletsprojects.com/en/2.0.x/installation/#virtual-environments).

## How to Get Started

To get started, complete the **Development Instructions** within the `server` and `interface` directory's `README.md` files. 

<!-- Get started by running the executable file

```
$ ./open_coding
```

Then, navigate to [http://localhost:3000/](http://localhost:3000/). Note that you may have to replace 'localhost' with your computer's IP address.

HappyDB is already available for annotation and label creation. If you would like to upload your own dataset, please see **Using Personal Data**. -->

## About this Repository

This repository is split into four main sections - data, interface, server, and training. Each section has a README further detailing it's implementation, but a short summary is given here.

### Data

The csv files loaded by the annotation interface are located here. The csv files must follow the format

```
ID,TEXT,
0,DATASET_TITLE,
1,TEXT_1,
...,...,
N,TEXT_N,
```

or they will be unable to be processed. By default, a cleaned version of [HappyDB](https://github.com/megagonlabs/HappyDB) is provided.

#### Using Personal Dataset

In the "data" folder, feel free to upload any csv files with the format specified above. Note that each entry *must* have a unique id. 

Then, quit and re-run the executable. On the introduction page, the dropdown should now include your DATASET_TITLE.

### Interface

All code necessary for the loading the webpage is located here, bootstrapped with [Create React App](https://github.com/facebook/create-react-app).  

### Server

All code necessary for storing, loading, and generating data for the website is located here. The local database is built using [SQLite](https://docs.python.org/3/library/sqlite3.html), and interactions between the Python backened and the Javascript frontend are achieved using [Flask](https://flask.palletsprojects.com/en/2.0.x/).

### Training

All classification models and any model training code exist here. 

### Results

This is where your final, labeled csv file will be saved

## Server Setup

ssh into lab server, start [tmux](https://github.com/tmux/tmux/wiki), create necessary terminals + start run of localhost:3000/8000
if ssh connection closes processes still run