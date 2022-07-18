# Open Coding for Machine Learning

Open Coding for Machine Learning is an annotation interface that allows a single annotator to efficiently and effectively devise labels and descriptions for a large, unlabeled dataset. 

More information about this project can be found at [TODO: paper link](google.com).

---

This interface requires the installation of npm ([MacOS example](https://changelog.com/posts/install-node-js-with-homebrew-on-os-x)) [Ubuntu Example](https://linuxize.com/post/how-to-install-node-js-on-ubuntu-20-04/). This interface also requires the installation of [Flask](https://flask.palletsprojects.com/en/2.0.x/installation/#virtual-environments), and [Hugging Face Transformers](https://huggingface.co/docs/transformers/installation).

[Homebrew](https://docs.brew.sh/Installation) is recommended for MacOS users. 

## How to Get Started

### Navigation

To start, open your terminal and navigate into the `OpenCodingForMachineLearning` directory. The commands `cd` and `ls` may be helpful, as well as [this guide](https://terminalcheatsheet.com/guides/navigate-terminal). 

When finished, the command `ls` should list out the five main directories of this project - `data`, `interface`, `results`, `server`, and `training`, in addition to a few other files. 

### Permissions

To help make library installations and running the application more smooth, we have provided two executable files, `setup.sh` and `opencoding.sh`. These files likely already have `read` permissions, but we will need them to have `execute` permissions in order to run them below. More information about permissions can be found [here](https://terminalcheatsheet.com/guides/navigate-terminal).

Run the following commands to add `execute` permissions to our `.sh` files.

```
$ chmod +x setup.sh
$ chmod +x opencoding.sh
```

### Installations

This interface requires the installation of npm ([MacOS example](https://changelog.com/posts/install-node-js-with-homebrew-on-os-x)) [Ubuntu Example](https://linuxize.com/post/how-to-install-node-js-on-ubuntu-20-04/). 

Follow the instructions in the links above or your preferred method of installation for your machine to install npm. 

Complete the remaining necessary installations by running the command

```
$ ./setup.sh
```

in the terminal within the `OpenCodingForMachineLearning` directory. If you have an M1 chip, you may run into issues installing the necesary dependies for the `server` part of the project - please see the `README.md` file within `server` for troubleshooting guidelines. 

IF any issues arise with installations, you may also consult the **Development Instructions** within the `training`, `server`, and `interface` directories' `README.md` files (**in order**).

### Running the Project Application

Finally, run the following commaned within the `OpenCodingForMachineLearning` directory.

```
# ./opencoding.sh
```

Then, navigate to [http://localhost:3000/](http://localhost:3000/). Note that you may have to replace 'localhost' with your computer's IP address. You should see the introduction page!

HappyDB is already available for annotation and label creation, in addition to a few other datasets. If you would like to upload your own dataset, please see **Using Personal Data**.

### Closing the Project Application

When you're done using the application, close the `http://localhost:3000/` tab and press the following keys after clicking on your terminal:

`Command + C` for Mac users
`Control + C` for Windows users

If you've accidentally closed the terminal before quitting and the website is still working, you will have to find the processes related to the ports `8000` and `3000` and kill them. The following commands are useful for finding and killing respectively, and this [stack overflow thread](https://stackoverflow.com/questions/3855127/find-and-kill-process-locking-port-3000-on-mac) may also be useful. 

```
$ sudo lsof -i :[PORT NUMBER]
$ kill -15 [PID]
```

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
