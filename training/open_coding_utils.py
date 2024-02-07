# uncomment these imports for local running
# from open_coding_constants import model_options
# import open_coding_roberta
# import open_coding_distilbert

# import style required by FLASK
from .open_coding_constants import model_options
from . import open_coding_roberta
from . import open_coding_distilbert
from . import open_coding_llama

def get_model(model_type):
    '''
    Given a string model type, returns a special variant of the OpenCodingModel

    Raises AttributeError if model type not supported.

    Returns: OpenCodingModel initializer, which expects a num_labels (int) as input.
    '''
    if model_type not in model_options:
        raise AttributeError('Model type not supported')
    
    if model_type == 'roberta':
        return open_coding_roberta.OpenCodingModel
    elif model_type == 'llama':
        return open_coding_llama.OpenCodingModel
    else:
        return open_coding_distilbert.OpenCodingModel
