# Importing dei framework Flask e CORS per l'inizializzazione del servizio API
from flask_jwt_extended import JWTManager, get_jwt, jwt_required
from JWT.auth_decorator import require_role
from blueprint.auth import auth_blueprint
from blueprint.user_pool import team_blueprint
from blueprint.progress import progress_blueprint
from config.secret_key import SECRET_KEY
from flask import Flask, jsonify
from entity.role import ROLE
from flask_cors import CORS
# Import per la libreria dei servizi streaming
from flask_socketio import SocketIO
from streaming_socket.socket import Socket

# Definizione dell'istanza dell'app
app = Flask(__name__)
CORS(app, resources={r"/socket/*": {"origins": "*"}})
app.config['JWT_SECRET_KEY'] = SECRET_KEY 
jwt = JWTManager(app)

# Registrazione dei blueprint
app.register_blueprint(auth_blueprint, url_prefix='/api')
app.register_blueprint(team_blueprint, url_prefix='/api')
app.register_blueprint(progress_blueprint, url_prefix='/api')

# Creazione dell'istanza dei servizi streaming
socketio = SocketIO(app, cors_allowed_origins="*")
socketio.on_namespace(Socket('/socket'))

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
    socketio.run(app, host='0.0.0.0', port=6000)
