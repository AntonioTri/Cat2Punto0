
document.getElementById("login-form").addEventListener("submit", async function(event) {
    event.preventDefault(); // Evita l'invio predefinito del form

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://127.0.0.1:5000/login", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            //Alert mi restituisce un pop up in cima alla pagina con il messaggio definito in input
            //alert(data.msg);
            window.location.replace("../templates/button.html"); // Percorso relativo

        } else {
            alert(`Errore: ${data.msg}`);
        }

    } catch (error) {
        console.error("Errore durante la richiesta:", error);
        alert("Si è verificato un errore durante la comunicazione con il server.");
    }
});
