from flask import Flask

app = Flask(__name__)
TEST_PORT_NUMBER = 5555

@app.route("/user_model")
def home():
    response = {"ok": True, "body": "<p>Welcome to the test home page! Nothing is set up yet.</p>"}
    return response

@app.route("/user_model/train")
def train():
    response = {"ok": True, "body": "<p>Welcome to the train page! Nothing is set up yet.</p>"}
    return response

@app.route("/user_model/predict")
def predict():
    response = {"ok": True, "body": "<p>Welcome to the predict page! Nothing is set up yet.</p>"}
    return response

if __name__ == "__main__":
    app.run(debug=True, port=TEST_PORT_NUMBER)