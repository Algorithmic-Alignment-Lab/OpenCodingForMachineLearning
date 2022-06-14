import torch

def predict_labels(unlabeled_data, tokenizer, model, max_length):
    '''
    Predicts labels for a given series of texts.

    Given an iterable of data in the form {text: str, id: int}, returns an array
    of labeled data in the form {id: int, text: str, label: [str]}.
    '''
    model.set_forward_type('FINETUNE')
    predictions = []
    id_to_label = model.mappings['id_to_label']

    for elem in unlabeled_data:
        text, id = elem['text'], elem['id']
        tokenized = tokenizer(text, return_tensors="pt", truncation=True, max_length=max_length)
        output = model(**tokenized)
        # TODO: get all labels above a certain percentage of confidence
        prediction = torch.argmax(output.logits, axis=1)[0].item()
        label = id_to_label[prediction]

        predictions.append({'id': id, 'text': text, 'label': label})

    return predictions