# Importing dei framework Flask e CORS per l'inizializzazione del servizio API
from flask import Flask, jsonify, request
from flask_cors import CORS

# Import del database
from db.db import database

# Definizione dell'istanza dell'app
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

# Rotta per la registrazione, metodo POST
@app.route('/login', methods=['POST'])
def register_user():
    # Estrazione dei data dalla richiesta
    data = request.get_json()

    # Controlli di integrità dei dati
    if "username" not in data and password not in data:
        return {"msg": "Errore nella richiesta, deve contenere username e password come campi!"}, 404

    # Estraiamo i dati dalla richiesta
    username = data["username"]
    password = data["password"]

    # Registrazione del nuovo utente
    return database.register_new_user(username=username, password=password)
    
# Rotta per il login, metodo PUT
@app.route('/login', methods=['PUT'])
def login_user():
        # Estrazione dei data dalla richiesta
    data = request.get_json()

    # Controlli di integrità dei dati
    if "username" not in data and password not in data:
        return {"msg": "Errore nella richiesta, deve contenere username e password come campi!"}, 404

    # Estraiamo i dati dalla richiesta
    username = data["username"]
    password = data["password"]

    # Registrazione del nuovo utente
    return database.login_user(username=username, password=password)



def message(message: str, code: int) -> dict:
    return {"msg" : message}, code


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)