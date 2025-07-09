import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from api.umap import umap_api
from api.llm_eda import llm_eda_api
from api.differentialexpression import dea_api
from api.correlationexplorer import correlation_api

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": [
    "http://localhost:3000",
    "http://192.168.1.110:3000",
    "https://bioai.sarahrebeccameyer.com"
]}})

@app.route("/")
def hello():
    return "👋 Hello from the Raspberry Pi - Backend 6th of July 17.00!"

app.register_blueprint(umap_api)
app.register_blueprint(llm_eda_api)
app.register_blueprint(dea_api)
app.register_blueprint(correlation_api)

if __name__ == "__main__":
    # Get configuration from environment variables
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    
    app.run(host=host, port=port, debug=debug)
