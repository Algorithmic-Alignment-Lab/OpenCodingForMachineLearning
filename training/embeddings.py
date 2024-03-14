import logging
import sys

[sys.path.append(i) for i in ['.']]
import csv
import math 
from typing import List
import os
import numpy as np
import torch
from torch import nn
import json
import replicate

from torch.utils.data import DataLoader, TensorDataset
from torch.optim import Adam
from sklearn.model_selection import train_test_split
from dataclasses import dataclass

# uncomment these imports for local running
# from finetune import convert_labels
# from open_coding_embed_classifier import OpenCodingModel

# import style required by FLASK
from .finetune import convert_labels
from .open_coding_embed_classifier import OpenCodingModel

# prevents automatic weights and biases logging
os.environ["WANDB_DISABLED"] = "true"

@dataclass
class TrainResult:
    r"""
    A collection containing everything we need to know about the training results
    """

    num_epochs: int
    lr: float

    # The trained model
    model: nn.Module

    # Training loss (saved at each iteration in `train_epoch`)
    train_losses: List[float]

    # Training accuracies, before training and after each epoch
    train_accs: List[float]
    
    # Validation accuracies, before training and after each epoch
    val_accs: List[float]

def bge_classification_funetine(num_labels, data_tuple, label_id_mappings, batch_size, num_epochs, output_filename):

    # Get embeddings from Replicate API using BAA's nateraw/bge-large-en-v1.5
    texts, labels, embeddings = get_embeddings(data_tuple)

    # Save embeddings locally as json file named output_filename_embeddings
    save_text_to_embeddings(data_tuple, embeddings, output_filename)

    train_classifier(num_labels, embeddings, labels, label_id_mappings, batch_size, num_epochs, output_filename)
    return 'Completed Training'

def get_embeddings(data_tuple):
    texts, labels = data_tuple
    # Returns a list of length n, where n = len(texts), where each element is a list of len 1024 for the embedding
    embeddings = replicate.run("nateraw/bge-large-en-v1.5:9cf9f015a9cb9c61d1a2610659cdac4a4ca222f2d3707a68517b18c198a9add1",
    input={"texts": json.dumps(texts)})

    if len(texts) != len(embeddings):
        raise ValueError("Length of embeddings does not match length of texts")

    return (texts, labels, embeddings)

def save_text_to_embeddings(data_tuple, embeddings, output_filename):
    if len(data_tuple[0]) == len(embeddings):
        # data_dump has [texts, labels, embeddings]
        data_dump = list(data_tuple) + [embeddings]
        # Open the file in binary write mode
        with open(output_filename+"_embeddings", 'wb') as file:
            # Use json to serialize the list of lists and save it to the file
            json.dump(data_dump, file)
            return output_filename+"_embeddings"
    else: 
        raise ValueError("Length of embeddings does not match length of texts")
    
def train_classifier(num_labels, embeddings, labels, label_id_mappings, batch_size, num_epochs, output_filename):
    # convert embeddings to tensor
    embeddings_tensor = torch.tensor(embeddings, dtype=torch.float32)
    converted_labels = torch.tensor(convert_labels(labels, label_id_mappings), dtype=torch.long)

    # Splitting the dataset into training and validation sets
    embeddings_train, embeddings_val, labels_train, labels_val = train_test_split(embeddings_tensor, converted_labels, test_size=0.2, random_state=42)

    # Creating DataLoader for training and validation
    train_dataset = TensorDataset(embeddings_train, labels_train)
    val_dataset = TensorDataset(embeddings_val, labels_val)

    train_loader = DataLoader(train_dataset, batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size, shuffle=False)

    model = OpenCodingModel(num_labels)
    model.update_label_id_mapping(label_id_mappings)
    model.train()

    optimizer = Adam(model.parameters(), lr=1e-3)

    # Training loop
    for epoch in range(num_epochs):
        total_loss = 0
        for batch in train_loader:
            embeddings_batch, labels_batch = batch
            optimizer.zero_grad()
            loss, logits = model(input_features=embeddings_batch, labels=labels_batch)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
        print(f"Epoch {epoch+1}, Loss: {total_loss / len(train_loader)}")

        # Validation 
        model.eval()
        with torch.no_grad():
            val_loss = 0
            for batch in val_loader:
                embeddings_batch, labels_batch = batch
                loss, logits = model(input_features=embeddings_batch, labels=labels_batch)
                val_loss += loss.item()
            print(f"Validation Loss: {val_loss / len(val_loader)}")
        model.train()

    # Save model
    torch.save(model.state_dict(), output_filename)
    return 'Completed Training'