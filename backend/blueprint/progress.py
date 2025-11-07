from flask import Blueprint, request
from controller.controller_manage_progress import ControllerManageProgress
from JWT.auth_decorator import require_role
from entity.role import ROLE
from flask_jwt_extended import jwt_required
from utils.info_logger import getFileLogger
from utils.perk_cache import send_lockers_cache

logger = getFileLogger(__name__)

progress_blueprint = Blueprint('progress_api', __name__)


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

