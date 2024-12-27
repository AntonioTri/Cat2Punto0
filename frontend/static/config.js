const ENVIROMENT_VARIABLE = "PRODUCTION";

// let dovrebbe inizializzare la variabile in modo correto
let API_URL = "";

// Se la variabile d'ambiente è settata su TEST le chiamate vengono effetuate sul localhost
if (ENVIROMENT_VARIABLE === "TEST") {
    API_URL = `http://localhost:5000/api`;

// URL dell'API (modificato per utilizzare il reverse proxy)
} else if(ENVIROMENT_VARIABLE === "PRODUCTION") {
    API_URL = `${window.location.protocol}//${window.location.host}/api`;
}


// Esportiamo le variabili
export { API_URL };