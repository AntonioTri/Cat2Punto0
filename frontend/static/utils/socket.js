import { SOCKET_URL } from "../../static/config.js";

const socket = io(SOCKET_URL, {
    // Disabilita polling, usa solo WebSocket
    transports: ["websocket"]  
});

// Registrazione nel sistema dell'utente
socket.on('connect', () => {

    localStorage.setItem('socket', socket.id);
    console.log("Connessione alla socket avvenuta con successo. Id: ", socket.id);

    // Emetti l'evento per aggiornare la socket dell'utente
    socket.emit('update_personal_socket', { id: localStorage.getItem("personal_id") }, (response) => {
        // Gestisci la risposta del server
        if (response && response.msg) {
            console.log('Risposta dal server:', response.msg);
        } else {
            console.log('Socket personale aggiornato correttamente');
        }
    });

});

socket.on('test_signal_recieved', (response) => {
    console.log('Segnale di risposta ricevuto!', response);
});


export { socket };