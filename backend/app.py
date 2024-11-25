from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app=app)

# Contatore globale
counter = 0
# Utenti globali 
utenti = []

# Endpoint per ottenere il valore attuale del contatore
@app.route('/counter', methods=['GET'])
def get_counter():
    return jsonify({"counter": counter})


# Endpoint per incrementare il contatore
@app.route('/counter', methods=['POST'])
def increment_counter():
    global counter
    counter += 1
    return jsonify({"counter": counter})


@app.route('/login', methods=['POST'])
def register_user():
    data = request.get_json()

    if data in utenti:
        return message("Utente già presente nel DB.", 404)
    else:
        utenti.append(data)
        return message("Utente registrato correttamente.", 200)
    

@app.route('/login', methods=['PUT'])
def login_user():
    data = request.get_json()

    if data not in utenti:
        return message("Credenziali errate.", 404)
    elif data in utenti:
        return message("Login effettuato", 200)
    
    return message("OPS. Qualcosa è andato storto ...", 404)


def message(message: str, code: int) -> dict:
    return {"msg" : message}, code




if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)