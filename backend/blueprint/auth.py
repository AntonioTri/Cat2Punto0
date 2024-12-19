from flask import Blueprint, request
from controller.controller_manage_users_AUTH import ControllerManageUsersAUTH
from JWT.auth_decorator import require_role
from entity.role import ROLE

# Dichiarazione del blueprint sul quale vivono le rotte dei login e registrazione degli utenti
auth_blueprint = Blueprint('api', __name__)


# Rotta per la registrazione, metodo POST
# Richiede il livello amministratore per essere raggiunto
@auth_blueprint.route('/login', methods=['POST'])
@require_role(role = ROLE.ADMIN.value)
def register_user():
    # Estrazione dei data dalla richiesta
    data = request.get_json()

    # Controlli di integrità dei dati
    if "username" not in data or "password" not in data or "role" not in data:
        return {"msg": "Errore nella richiesta, deve contenere username, password e ruolo come campi!"}, 404

    # Registrazione del nuovo utente
    return ControllerManageUsersAUTH.register_user(data)



# Rotta per il login, metodo PUT
# Non richiede alcun livello di autorizzazione ma ne restituisce uno in base al ruolo registrato nel db
@auth_blueprint.route('/login', methods=['PUT'])
def login_user():
    # Estrazione dei data dalla richiesta
    data = request.get_json()

    # Controlli di integrità dei dati
    if "username" not in data or "password" not in data:
        return {"msg": "Errore nella richiesta, deve contenere username e password come campi!"}, 404

    # Login dell'utente, il controller si occupa di interfacciarsi con il db e di gestire le risposte
    return ControllerManageUsersAUTH.login_user(data)