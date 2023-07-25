from flask import Flask, request
from transformers import GPT2Tokenizer, GPT2Model

app = Flask(__name__)
TEST_PORT_NUMBER = 5555

tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
model = GPT2Model.from_pretrained("gpt2")

@app.route("/user_model")
def home():
    response = {"body": "<p>Welcome to the test home page! Nothing is set up yet.</p>"}
    add_options(response)
    return response

# for now, I'm assuming the user will have dealt with training on their own.
# i.e. taking the labels from results csv and training on that
@app.route("/user_model/train")
def train():
    response = {"body": "<p>Welcome to the train page! Nothing is set up yet.</p>"}
    add_options(response)
    return response

@app.route("/user_model/predict", methods=['GET'])
def predict():
    response = {"body": "<p>Welcome to the predict page! Nothing is set up yet.</p>"}
    
    try:
        input_text = request.args.get("text")
        encoded_input = tokenizer(input_text, return_tensors="pt")
        encoded_output = model(**encoded_input)
        string_output = tokenizer.decode(encoded_output, skip_special_tokens=True)
        print(string_output)
        response["output"] = string_output
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