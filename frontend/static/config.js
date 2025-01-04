const ENVIROMENT_VARIABLE = "PRODUCTION";

// let dovrebbe inizializzare la variabile in modo correto
let API_URL = "";
let SOCKET_URL = "";

// Se la variabile d'ambiente è settata su TEST le chiamate vengono effetuate sul localhost
if (ENVIROMENT_VARIABLE === "TEST") {
    API_URL = `http://localhost:5000/api`;
    SOCKET_URL = `http://localhost:5000/socket`;

// URL dell'API (modificato per utilizzare il reverse proxy)
} else if(ENVIROMENT_VARIABLE === "PRODUCTION") {
    API_URL = `${window.location.protocol}//${window.location.host}/api`;
    SOCKET_URL = `${window.location.protocol}//${window.location.host}/socket`;
}


// Esportiamo le variabili
export { API_URL, SOCKET_URL };