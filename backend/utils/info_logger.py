import logging

logger = logging.getLogger(__name__)  # Usa getLogger invece di Logger

# Configura il logger (se non è già configurato altrove)
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")

logger.info("Questo è un messaggio di log.")

def getFileLogger(name: str = __name__):
    return logging.getLogger(name)