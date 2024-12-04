
import {API_URL} from './config.js';
const URL = `${API_URL}/counter`;

// Elementi della pagina
const button = document.getElementById("increment-button");
const counterDisplay = document.getElementById("counter-display");

function getToken(){
    console.log("Token ottenuto dal local storage:", localStorage.getItem("access_token"));
    return localStorage.getItem("access_token");
}

// Funzione per aggiornare il contatore
async function updateCounter() {
    try {
        // Quando eseguiamo una fetch su un url possiamo agiungere una
        // closure per inserire i metodi e headers come l'autorizzazione
        const response = await fetch(URL, {

            method: "GET",
            headers: {
                "Authorization": `Bearer ${getToken()}`
            }

        });

        // Dopo aver ricevuto la risposta estraiamo i dati ed aggiorniamo il contatore
        const data = await response.json();
        counterDisplay.textContent = `Contatore: ${data.counter}`;

    } catch (error) {
        console.error("Errore durante l'aggiornamento del contatore:", error);
    }
}

// Funzione per incrementare il contatore
async function incrementCounter() {

    try {
        const response = await fetch(URL, { 

            method: "POST",
            headers: {
                "Authorization": `Bearer ${getToken()}`
            }

        });

        const data = await response.json();
        counterDisplay.textContent = `Contatore: ${data.counter}`;

    } catch (error) {
        console.error("Errore durante l'incremento del contatore:", error);
    }
}

// Associa l'evento click al bottone
button.addEventListener("click", incrementCounter);

// Aggiorna il contatore inizialmente
updateCounter();
