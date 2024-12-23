from flask import Flask

app = Flask(__name__)

@app.route('/mammt', methods=['GET'])
def hello_mammt():
    return "<h1>HELLO MAMMT </h1>"

@app.route('/patt', methods=['POST'])
def hello_patt():
    return "<h1>HELLO PATT</h1>"

if __name__ == '__main__':
    app.run(port=5000)