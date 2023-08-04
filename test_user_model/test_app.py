from flask import Flask, request
from transformers import AutoTokenizer, AutoModelForCausalLM

app = Flask(__name__)
TEST_PORT_NUMBER = 5555

tokenizer = AutoTokenizer.from_pretrained("gpt2")
model = AutoModelForCausalLM.from_pretrained("gpt2")

PREDICTION_INPUT_KEY = "text"
PREDICTION_OUTPUT_KEY = "output"

@app.route("/user_model")
def home():
    response = {"body": "<p>Welcome to the test home page! Nothing is set up yet.</p>"}
    add_options(response)
    return response

# for now, I'm assuming the user will have dealt with training on their own.
# i.e. taking the labels from results csv and training on that
@app.route("/user_model/finetune")
def finetune():
    response = {"body": "<p>Welcome to the finetune page! Nothing is set up yet.</p>"}
    add_options(response)
    return response

@app.route("/user_model/predict", methods=['GET'])
def predict():
    response = {"body": "<p>Welcome to the predict page! Nothing is set up yet.</p>"}
    
    try:
        input_text = request.args.get(PREDICTION_INPUT_KEY)
        print(f"Input text = {input_text} w/ type {type(input_text)}")
        encoded_input = tokenizer(input_text, return_tensors="pt")
        encoded_output = model.generate(**encoded_input, max_new_tokens=15)
        string_output = tokenizer.decode(encoded_output[0])
        print(string_output)
        response[PREDICTION_OUTPUT_KEY] = string_output
        add_options(response)
    except Exception as e:
        response["ok"] = False
        print(e)
        response["statusText"] = str(e)
    
    return response

# make the response ok consistent
def add_options(response):
    '''
    Sets default options for all return responses that are successful.
    '''
    response["headers"] = {"content-type": "application/json"},
    response["ok"] = True
    return response


if __name__ == "__main__":
    app.run(debug=True, port=TEST_PORT_NUMBER)