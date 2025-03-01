import { SOCKET_URL } from "../../static/config.js";

const socket = io(SOCKET_URL, {
    // Disabilita polling, usa solo WebSocket
    transports: ["websocket"]  
});


// Quando la connessione alla socket è stabilita
socket.on('connect', () => {
    console.log('Connessione riuscita al server via WebSocket!');
    // Conserviamo la socket e la aggiorniamo nel back end
    localStorage.setItem('socket', socket.id);
    // Aggiornamento
    const data_to_send = {
        socket_id : socket.id,
        personal_id : localStorage.getItem('personal_id')
    };

    socket.emit('update_socket', data_to_send);

});


// Questo segnale viene attivato quando un nuovo client viene registrato
// La sua controparte si trova nel login, se un utente era gia' registrato
socket.on('socket_updated', (response) => {
    // Aggiornamento con esito positivo
    if (response.status_code === 201) {
        console.log('Socket registrata con successo sul server');
        console.log(response);

        // Viene segnalato globalmente che la socket e' ora utilizzabile
        document.dispatchEvent(new Event("socketInitialized"));

    // Aggiornamento con esito negativo
    } else {
        console.log('Errore:', response.message);
    }
});


// Metodo di test per vedere se arriva il segnale dalla socket quando il grafo del team
// viene esplorato
socket.on('signal_from_node', (data) => {
    console.log('Messaggio dal Progression Graph. Messaggio:', data)
})

// Questo segnale gestisce il log degli errori nel back end, daot che non si possono restituire 
// dizionari come in  una normale api restful
socket.on('error', (response) => {
    console.log('Some error occurred in the back end. Response: ', response);
});

export { socket };