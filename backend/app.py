# Importing dei framework Flask e CORS per l'inizializzazione del servizio API
from flask_jwt_extended import JWTManager, get_jwt, jwt_required
from JWT.auth_decorator import require_role
from blueprint.auth import auth_blueprint
from config.secret_key import SECRET_KEY
from flask import Flask, jsonify
from entity.role import ROLE
from flask_cors import CORS

# Definizione dell'istanza dell'app
app = Flask(__name__)
CORS(app=app)
app.config['JWT_SECRET_KEY'] = SECRET_KEY 
jwt = JWTManager(app)
app.register_blueprint(auth_blueprint, url_prefix='/api')

# Contatore globale
counter = 0


# Endpoint per ottenere il valore attuale del contatore
@app.route('/api/counter', methods=['GET'])
@require_role(ROLE.COMANDANTE.value)
def get_counter():
    return jsonify({"counter": counter})


# Endpoint per incrementare il contatore
@app.route('/api/counter', methods=['POST'])
@require_role(ROLE.COMANDANTE.value)
def increment_counter():
    global counter
    counter += 1
    return jsonify({"counter": counter})


# Endpoint per ottenere le rotte dell'api
@app.route('/api/routes', methods=['GET'])
@require_role(ROLE.ADMIN.value)
def get_routes():
    routes = []
    for rule in app.url_map.iter_rules():
        route_info = {
            "endpoint": rule.endpoint,
            "methods": list(rule.methods),
            "rule": str(rule)
        }
        routes.append(route_info)
    return jsonify(routes=routes), 200

# Questa funzione serve ad ottenere le proprie credenziali
#TODO: bisognerebbe aggiungere un modo per ritornare anche la password
@app.route('/api/me', methods=['GET'])
@jwt_required
def get_me():
    me = get_jwt()
    return {"username": me["username"], "role": me["role"]}, 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)