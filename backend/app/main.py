from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello():
    return "👋 Hello from the Raspberry Pi!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)


# from flask import Flask, jsonify
# from flask_cors import CORS

# def create_app():
#     app = Flask(__name__)
#     CORS(app)

#     @app.route('/api/hello')
#     def hello():
#         return jsonify({'message': 'Hello from Flask backend!'})

#     return app

# if __name__ == '__main__':
#     app = create_app()
#     app.run(debug=True)
