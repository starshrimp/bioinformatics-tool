from flask import Flask, jsonify
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)

    @app.route('/api/hello')
    def hello():
        return jsonify({'message': 'Hello from Flask backend!'})

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
