# Training

Within this directory are the files related to pre-training and fine-tuning OpenCodingModels, both for the OpenCodingForMachineLearning interface and for personal development tasks.

`finetune_model.py` is a good place to look for understanding how the the given model is finetuned for the interface. Thos interested in pretraining their own models should look towards `generate_pretrained_model.py`. 

The [HappyDB](https://www.kaggle.com/competitions/fake-news/data), [UCI SMS Spambase](https://archive-beta.ics.uci.edu/ml/datasets/sms+spam+collection), and [Fake News (Kaggle Competition)](https://www.kaggle.com/competitions/fake-news/data) datasets are all provided under `/data` and `/labeled_data` for pre-training and fine-tuning purposes.

## Pretraining Models

In order to generate your own pre-trained model to use for the interface, run 

```
$ python3 generate_pretrained_model.py [csv_filename] [batch_size] [num_epochs]
```

Note that [csv_filename] must be an unlabeled csv file within `/data/`. Use the already-existing csv files as an example, if needed.

This will save your pretrained model in models/{csv_filename}\_pretrained\_{batch_size}\_{percent_train}

## Finetuning Models

Run finetune_model.py to fine-tune an already a model on labeled data. Note that [csv_filename] must be a labeled csv file within `/labeled_data/`.

```
$ python3 finetune_model.py [model_filename] [csv_filename] [num_epochs] [percent_train]
```

The HappyDB, SMS Spambase, and Fake News (Kaggle Competition) (labeled) datasets are all provided under data and labeled data.

## Development Instructions

On your local machine or server, please run the following commaned within `/training` to create a pretrained OpenCodingModel for running the HappyDB OpenCodingForMachineLearning interface. 

This will require a fair amount of compute power, and it may take a significant amount of time.

```
$ python3 generate_pretrained_model.py happy_db 50 5
```

Alternatively, you can train models within the interface on your local machine. 