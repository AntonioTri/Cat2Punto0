from flask_socketio import disconnect
from flask_jwt_extended import decode_token
from functools import wraps
from utils.info_logger import getFileLogger

logger = getFileLogger(__name__)

def socket_require_role(role: str):
    def decorator(f):
        @wraps(f)
        def wrapped_function(self, data, *args, **kwargs):
            token = data.get('token')
            if not token:
                logger.info("Richiesta rifiutata: JWT mancante")
                return

            try:
                decoded = decode_token(token)

                # Se è un amministratore, bypassa i controlli
                if decoded["role"] == "ADMIN":
                    return f(self, data, *args, **kwargs)

                if decoded["role"] != role:
                    logger.info("Richiesta rifiutata: ruolo non valido")
                    return

                return f(self, data, *args, **kwargs)

            except Exception as e:
                logger.info(f"JWT non valido. token = {token}. Dati = {data}. Exception: {e}")
                disconnect()
                return

        return wrapped_function

    return decorator



def socket_require_token():
    def decorator(f):
        @wraps(f)
        def wrapped_function(self, data, *args, **kwargs):
            token = data.get('token')
            if not token:
                logger.info("🔒 Richiesta rifiutata: JWT mancante")
                return

            try:
                decode_token(token)  # Se fallisce, scatena eccezione
                return f(self, data, *args, **kwargs)

            except Exception as e:
                logger.info(f"🔒 JWT non valido. token = {token}. Dati = {data}. Exception: {e}")
                disconnect()
                return

        return wrapped_function

    return decorator