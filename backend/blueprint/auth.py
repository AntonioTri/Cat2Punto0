from flask import Blueprint, request
from controller.controller_manage_users_AUTH import ControllerManageUsersAUTH
from JWT.auth_decorator import require_role
from entity.role import ROLE

# Dichiarazione del blueprint sul quale vivono le rotte dei login e registrazione degli utenti
auth_blueprint = Blueprint('api', __name__)


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


