from flask import Flask
from api.umap import umap_api

app = Flask(__name__)

@app.route("/")
def hello():
    return "👋 Hello from the Raspberry Pi!"

app.register_blueprint(umap_api)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
