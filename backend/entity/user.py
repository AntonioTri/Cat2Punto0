from role import ROLE

# Classe USER che rappresenta gli utenti e le loro azioni del sito
class USER:
    def __init__(self, name: str = "generic_user", password: str = "generic_password", role: str = ROLE.COMANDANTE.value) -> None:
        self.name = name
        self.password = password
        self.role = role

    # Metodo per serializzare l'oggetto in un dizionario
    def dump(self) -> dict:
        return {
            "name": self.name,
            "password": self.password,
            "role": self.role,
        }

    # Metodo per ricostruire l'oggetto USER da un dizionario
    @classmethod
    def load(cls, data: dict) -> 'USER':
        return cls(
            name = data.get("name", "generic_user"),
            password = data.get("password", "generic_password"),
            role = data.get("role", ROLE.COMANDANTE.value),
        )