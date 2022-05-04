Run the following command in the server directory to activate the training server
```
$ . venv/bin/activate
```

Install the following packages within the virtual environment
```
$ pip install torch
$ pip install simpletransformers
```

For M1 machines, make sure to have conda installed, and then

```
$ conda activate st
```

If running on an M1 machine and facing import issues, try the steps listed [here](https://github.com/google/sentencepiece/issues/608)

https://towardsdatascience.com/installing-tensorflow-on-the-m1-mac-410bb36b776
https://developer.apple.com/forums/thread/693931
https://stackoverflow.com/questions/70670205/failed-to-build-h5py-on-mac-m1
https://github.com/google/sentencepiece/issues/608

Desired models should be saved and loaded from the /models directory.

Run generate_pretrained_model.py to pre-train a Distilbert model on unlabeled data.

```
python3 generate_pretrained_model.py model_output_filename data_csv_filename num_epochs percent_mask percent_use
```

OR

```
python3 generate_pretrained_model.py csv_filename batch_size num_epochs
```

The latter saves the pretrained model in models/{csv_filename}\_pretrained\_{batch_size}\_{percent_train}

Run finetune_model.py to fine_tune an already pre-trained model on labeled data.

```
python3 finetune_model.py model_filename labelend_data_csv num_epochs percent_train percent_use
```

In order to enable pretraining and validation runs, the HappyDB, SMS Spambase, and Fake News (Kaggle Competition) (labeled) datasets are all provided under data and labeled data.