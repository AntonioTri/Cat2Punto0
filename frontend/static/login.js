const URL = `${API_URL}/login`;

// Selezione del form
const loginForm = document.getElementById("login_form");

// Aggiunta dell'evento submit al form
loginForm.addEventListener("submit", async function(event) {
    event.preventDefault(); // Previene il comportamento predefinito del form

    // Raccolta dei dati
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        // Invio della richiesta al server
        const response = await fetch(`http://localhost:5000/api/login`, {
            method: "PUT", 
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
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
