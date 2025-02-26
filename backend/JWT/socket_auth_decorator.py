from flask_socketio import disconnect
from flask_jwt_extended import decode_token
from functools import wraps

def socket_require_role(role: str):
    def decorator(f):
        @wraps(f)
        def wrapped_function(self, data, *args, **kwargs):
            token = data.get('token')
            if not token:
                print("Richiesta rifiutata: JWT mancante")
                disconnect()
                return

            try:
                decoded = decode_token(token)

                # Se è un amministratore, bypassa i controlli
                if decoded["role"] == "ADMIN":
                    return f(self, data, *args, **kwargs)

                if decoded["role"] != role:
                    print("Richiesta rifiutata: ruolo non valido")
                    disconnect()
                    return

                return f(self, data, *args, **kwargs)

            except Exception:
                print("JWT non valido.")
                disconnect()
                return

        return wrapped_function

    return decorator
