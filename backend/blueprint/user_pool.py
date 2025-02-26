from controller.controller_team_pool import ControllerTeamPool
from utils.password_generator import generate_password
from flask import Blueprint, request, send_file
from JWT.auth_decorator import require_role
from entity.role import ROLE
from io import BytesIO

# Dichiarazione del blueprint sul quale vivono le rotte dei login e registrazione degli utenti
team_blueprint = Blueprint('pool_api', __name__)


@team_blueprint.route("/add_team", methods=['POST'])
@require_role(ROLE.ADMIN.value)
def add_new_team():
    # Controlli ed estrazione dei dati dalla richiesta
    data = request.get_json()
    if "team_name" not in data:
        return {"msg": f"La richiesta deve contenere il nome del team. Dati inviati: {data}"}, 400
    # Se i controlli passano viene inviata la richiesta al controller 
    return ControllerTeamPool.add_new_team(data["team_name"])



# Registra un nuovo utente in un team
@team_blueprint.route("/register_user", methods=['POST'])
@require_role(ROLE.ADMIN.value)
def register_new_user_to_team():
    # Controlli ed estrazione dei dati dalla richiesta
    data = request.get_json()

    # Controllo che `data` sia valido
    if not isinstance(data, dict):
        return {"msg": "La richiesta deve contenere un JSON valido."}, 400
        
    # Verifica che tutti i campi necessari siano presenti
    required_fields = ["username", "role", "team_id"]
    for field in required_fields:
        if field not in data:
            return {"msg": f"Il campo {field} è obbligatorio."}, 400
    
    # Chiamata al controller per registrare l'utente
    return ControllerTeamPool.register_new_user_to_team(
        username=data["username"], 
        # Importante notare come il campo password sia generato casualmente
        password= generate_password(), 
        role=data["role"], 
        team_id=data["team_id"]
    )



# Ottieni tutti i team
@team_blueprint.route("/get_all_teams", methods=['GET'])
@require_role(ROLE.ADMIN.value)
def get_all_teams():
    # Chiamata al controller per ottenere tutti i team
    teams, status_code = ControllerTeamPool.get_all_teams()

    # Ritorna i team formattati con il codice di stato
    return {"teams": teams}, status_code



# Ottieni tutti i team group
@team_blueprint.route("/get_all_team_group", methods=['GET'])
@require_role(ROLE.ADMIN.value)
def get_all_team_group():
    # Controlli ed estrazione dei dati dalla richiesta
    data = request.get_json()
    # Controllo per verificare l'esistenza dei campi
    if "team_id" not in data:
        return {"msg": f"Il campo 'team_id' è obbligatorio. Dati inviati {data}"}, 404

    # Chiamata al controller per ottenere tutti i team group
    team_groups, status_code = ControllerTeamPool.get_all_team_group(data["team_id"])

    # Ritorna i team group formattati con il codice di stato
    return {"team_groups": team_groups}, status_code



# Ottieni tutti i team group
@team_blueprint.route("/get_all_team_member", methods=['GET'])
@require_role(ROLE.ADMIN.value)
def get_all_team_members():
    # Controlli ed estrazione dei dati dalla richiesta
    data = request.get_json()
    # Controllo per verificare l'esistenza dei campi
    if "team_id" not in data:
        return {"msg": f"Il campo 'team_id' è obbligatorio. Dati inviati {data}"}, 404

    # Chiamata al controller per ottenere tutti i team group
    team_members, status_code = ControllerTeamPool.get_all_team_members(data["team_id"])

    # Ritorna i team group formattati con il codice di stato
    return {"team_members": team_members}, status_code




# Ottieni tutti i team
@team_blueprint.route("/get_team_pdf", methods=['PUT'])
@require_role(ROLE.ADMIN.value)
def get_team_pdf():
    # Estrazione del team_id dal JSON e controlli
    data = request.get_json()
    if "team_id" not in data:
        return {"msg": f"Il campo 'team_id' è obbligatorio. Dati inviati: {data}"}, 400

    # Chiamata al controller per generare il PDF
    pdf_content, status_code = ControllerTeamPool.generate_team_pdf(team_id=data["team_id"])

    if status_code != 200:
        return {"msg": pdf_content.decode('utf-8')}, status_code  # Restituisci il messaggio come stringa

    # Usa BytesIO per passare i dati binari a send_file
    return send_file(
        BytesIO(pdf_content),
        mimetype='application/pdf',
        as_attachment=True,
        download_name='team_info.pdf'
    ), status_code

