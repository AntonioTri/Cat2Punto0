// Import della variabile API_URL settata in automatico nel file di config
import {API_URL} from './config.js';
const URL = `${API_URL}/login`;

// Selezione del form
const loginForm = document.getElementById("login_form");

// Aggiunta dell'evento submit al form
loginForm.addEventListener("submit", async function(event) {
    // Previene il comportamento predefinito del form
    event.preventDefault(); 

    // Raccolta dei dati
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {

        // Invio della richiesta al server
        const response = await fetch(URL, {
            method: "PUT", 
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log(data)

        // In caso di risposta positiva si memorizza nel local storage l'access token
        if (response.ok) {
            
            let access_token = data.access_token;
            console.log(access_token)

            localStorage.setItem('access_token', access_token);
            
            // Reindirizzamento in caso di successo
            window.location.replace("../templates/button.html");

        } else {
            // Gestione degli errori dal server
            alert(`Errore: ${data.msg || "Credenziali non valide."}`);
        }

    } catch (error) {
        // Gestione degli errori di rete o runtime
        console.error("Errore durante la richiesta:", error);
        alert("Si è verificato un errore durante la comunicazione con il server.");
    }
});
