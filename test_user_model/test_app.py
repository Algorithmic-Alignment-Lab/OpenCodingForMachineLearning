from flask import Flask

app = Flask(__name__)
TEST_PORT_NUMBER = 5555

@app.route("/")
def home():
    return "<p>Welcome to test_app.py! Haven't implemented anything yet :)</p>"

@app.route("/train")
def train():
    return "<p>Welcome to the train page! Nothing is set up yet.</p>"

@app.route("/predict")
def predict():
    return "<p>Welcome to the predict page! Nothing is set up yet.</p>"

if __name__ == "__main__":
    app.run(debug=True, port=TEST_PORT_NUMBER)