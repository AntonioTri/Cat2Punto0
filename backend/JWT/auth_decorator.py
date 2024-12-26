from flask import jsonify
from functools import wraps
from flask_jwt_extended import jwt_required, get_jwt
from flask import jsonify
from functools import wraps


def require_role(role: str):
    """
    Decoratore per controllare che l'utente abbia un determinato ruolo nel JWT.
    """
    def decorator(f):
        @wraps(f)
        @jwt_required()  # Richiede un token JWT valido
        def decorated_function(*args, **kwargs):

            # Ottieni l'identità dell'utente e il payload del JWT
            jwt_payload = get_jwt()

            # Se l'utente è un amministratore, si bypassano i controlli di ruolo
            if jwt_payload["role"] == "ADMIN":
                return f(*args, **kwargs)

            # Verifica che il ruolo corrisponda al richiesto
            if jwt_payload["role"] != role:
                return jsonify({"error": "Permessi insufficienti"}), 403

            # Passa al prossimo livello
            return f(*args, **kwargs)

        return decorated_function

    return decorator
