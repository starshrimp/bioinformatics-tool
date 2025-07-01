from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello():
    return "👋 Hello from the Raspberry Pi!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)


# (No replacement lines; the commented-out code is removed entirely.)
