from flask import Blueprint, request
from controller.controller_manage_progress import ControllerManageProgress
from JWT.auth_decorator import require_role
from entity.role import ROLE
from flask_jwt_extended import jwt_required

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
