// Import della variabile API_URL settata in automatico nel file di config
import {API_URL} from './config.js';
const URL = `${API_URL}/login`;
import { socket } from './utils/socket.js';

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
        console.log(data);

        // In caso di risposta positiva si memorizza nel local storage l'access token
        if (response.ok) {

            let role = formatRole(data.role);
            
            // Conserviamo nel local storage l'access token ed il ruolo
            // Il ruolo viene conservato come formattato e non formattato
            localStorage.setItem('personal_id', data.personal_id);
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('team_id', data.team_id);personal_id
            localStorage.setItem('unformatted_role', data.role);
            localStorage.setItem('role', role);
            
            // Reindirizzamento in caso di successo
            window.location.replace(`../templates/${role}/${role}_homepage.html`);

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


function formatRole(role){

    // Sulla base del ruolo viene restituito un particolare indice dal quale
    // navigare l'albero del ruolo
    switch (role) {
        case 'ADMIN':
            return 'admin';

        case 'COMANDANTE':
            return 'commander';

        case 'DETECTIVE':
            return 'detective';    

        case 'ESPLORATORE':
            return 'explorer';  

        case 'DECRITTATORE':
            return 'decripter';

        default:
            return 'commander';

    }

}
