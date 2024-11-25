// URL dell'API
const API_URL = "http://127.0.0.1:5000/counter";

// Elementi della pagina
const button = document.getElementById("increment-button");
const counterDisplay = document.getElementById("counter-display");

// Funzione per aggiornare il contatore
async function updateCounter() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        counterDisplay.textContent = `Contatore: ${data.counter}`;
    } catch (error) {
        console.error("Errore durante l'aggiornamento del contatore:", error);
    }
}

// Funzione per incrementare il contatore
async function incrementCounter() {
    try {
        const response = await fetch(API_URL, { method: "POST" });
        const data = await response.json();
        console.log(data)
        counterDisplay.textContent = `Contatore: ${data.counter}`;
    } catch (error) {
        console.error("Errore durante l'incremento del contatore:", error);
    }
}

// Associa l'evento click al bottone
button.addEventListener("click", incrementCounter);

// Aggiorna il contatore inizialmente
updateCounter();