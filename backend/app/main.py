import os
from dotenv import load_dotenv
from flask import Flask
from api.umap import umap_api

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

@app.route("/")
def hello():
    return "👋 Hello from the Raspberry Pi!"

app.register_blueprint(umap_api)


if __name__ == "__main__":
    # Get configuration from environment variables
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    
    app.run(host=host, port=port, debug=debug)
