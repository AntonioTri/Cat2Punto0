from flask import Blueprint, request
from controller.controller_manage_progress import ControllerManageProgress
from JWT.auth_decorator import require_role
from entity.role import ROLE
from flask_jwt_extended import jwt_required
from utils.info_logger import getFileLogger
from utils.perk_cache import send_lockers_cache

logger = getFileLogger(__name__)

progress_blueprint = Blueprint('progress_api', __name__)

# Ottieni i progressi di un team
@progress_blueprint.route("/get_team_progress", methods=['GET'])
@require_role(ROLE.ADMIN.value)
def get_team_progress():
    """
    Endpoint per ottenere tutti i progressi di un team specifico.
    """
    team_id = request.args.get("team_id", type=int)

    if team_id is None:
        return {"msg": "Il parametro 'team_id' è obbligatorio."}, 400

    team_progress, status_code = ControllerManageProgress.get_team_progress(team_id=team_id)

    return team_progress, status_code

# Ottieni i progressi di un team
@progress_blueprint.route("/get_team_signals", methods=['GET'])
@require_role(ROLE.ADMIN.value)
def get_team_signals():
    """
    Endpoint per ottenere tutti i segnali di un team specifico.
    """
    team_id = request.args.get("team_id", type=int)

    if team_id is None:
        return {"msg": "Il parametro 'team_id' è obbligatorio."}, 400

    team_progress, status_code = ControllerManageProgress.get_team_signals(team_id=team_id)

    return team_progress, status_code


# Aggiungi un segnale a un team
@progress_blueprint.route("/add_team_signal", methods=['POST'])
@jwt_required()
def add_team_signal():
    """
    Endpoint per aggiungere un segnale a un team specifico.
    """
    data = request.get_json()

    if not data or "team_id" not in data or "signal" not in data:
        return {"msg": "I campi 'team_id' e 'signal' sono obbligatori."}, 400

    response, status_code = ControllerManageProgress.add_team_signals(
        team_id=data["team_id"], 
        signal_unlocked=data["signal"]
    )

    return response, status_code


# Ottieni i progressi di un ruolo specifico in un team
@progress_blueprint.route("/get_role_progress", methods=['GET'])
@jwt_required()
def get_role_progress():
    """
    Endpoint per ottenere i progressi di un ruolo specifico in un team.
    """
    team_id = request.args.get("team_id", type=int)
    role = request.args.get("role", type=str)

    if team_id is None or role is None:
        return {"msg": "I parametri 'team_id' e 'role' sono obbligatori."}, 400

    progress, status_code = ControllerManageProgress.get_team_group_progress(
        team_id=team_id, 
        role=role
    )

    return {"progress": progress}, status_code


# Aggiungi un progresso a un ruolo specifico in un team
@progress_blueprint.route("/add_role_progress", methods=['POST'])
@jwt_required()
def add_role_progress():
    """
    Endpoint per aggiungere un progresso a un ruolo specifico in un team.
    """
    data = request.get_json()

    if not data or "team_id" not in data or "role" not in data or "progress_done" not in data:
        return {"msg": "I campi 'team_id', 'role' e 'progress_done' sono obbligatori."}, 400

    response, status_code = ControllerManageProgress.add_team_group_progress(
        team_id=data["team_id"], 
        role=data["role"], 
        unlocked_progress=data["progress_done"]
    )

    return response, status_code

@progress_blueprint.route('/get_detective_progresses', methods=['GET'])
@require_role(ROLE.DETECTIVE.value)
def det_detective_progresses():
    
    # Estraiamo il tipo di progresso selezionato dalla query args
    selected_type = request.args.get('type', None)
    selected_team = request.args.get('team_id', None)
    if selected_type is None or selected_team is None:
        return {"msg" : "Errore nella richiesta, un campo tra type e team_id manca."}, 404
    
    # Richiamo al metodo del controller
    return ControllerManageProgress.get_detective_progress_by_type(team_id=selected_team, selected_type=selected_type)


@progress_blueprint.route('/answer_riddle', methods=['PUT'])
@jwt_required()
def answer_graph_riddle():

    # Estraiamo la risposta dalla richiesta ed il team_id
    data: dict = request.get_json()
    answer: str = data.get('answer', None)
    team_id : int = data.get('team_id', None)
    socket : str = data.get('socket', None)
    team_id = int(team_id)

    # Check per la presenza dei dati
    if answer is None or team_id is None or socket is None:
        return {"msg" : f"Dei dati mancano nella richiesta. Dati inviati {data}"}, 404

    logger.info(f"Dati inviati alla ANSWER RIDDLE: {data}")

    # Richiamo al metodo del controller
    return ControllerManageProgress.check_if_answer_is_correct(answer=answer, team_id=team_id, socket_to_signal=socket)


@progress_blueprint.route('/get_locker_statuses', methods=['GET'])
@jwt_required()
def get_current_lockers():

    # Estraiamo i dati dall'header
    requester_socket = request.args.get('socket', None)
    team_id = request.args.get('team_id', None)
    locker_name = request.args.get('locker_name', None)

    # Controllo dei campi inviati
    if requester_socket is None or team_id is None:
        return {"mgs" : f"Dati negli args mancanti. Args mandati: {request.args}"}, 404
    # Conversione del team id
    else:
        team_id = int(team_id)
    
    # Richiamo alla funzione che invia i dati della cache
    send_lockers_cache(locker_name=locker_name, team_id=team_id, socket=requester_socket) 
    
    # Ritorno dello status
    return {"msg" : "Retrieve della cache dei locker avvenuta consuccesso!"}, 200

