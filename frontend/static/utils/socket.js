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



// Intercetta l'evento di ricarica o chiusura della pagina
window.addEventListener('beforeunload', function() {
    // Imposta un flag per indicare che la pagina sta per essere ricaricata o chiusa
    sessionStorage.setItem('is_reloading', 'true');
    // Invia un segnale al server
    const data_to_send = {
        socket_id : localStorage.getItem('socket'),
        personal_id : localStorage.getItem('personal_id')
    };
    socket.emit('page_reload', data_to_send);
});

window.addEventListener('load', () => {
    console.log('La pagina è stata completamente caricata!');
    // Esegui azioni specifiche dopo il caricamento
    const are_graph_data_saved = localStorage.getItem('are_graph_data_saved')

    // Nel caso in cui non ci siano dati salvati, allora richiediamo alla API di mandarli
    if (!are_graph_data_saved) {
        // Definiamo i dati da mandare
        const data_to_send = {
            personal_id : localStorage.getItem('personal_id'),
            team_id : localStorage.getItem('team_id'),
            socket : localStorage.getItem('socket')
        }

        socket.emit('get_save_data', data_to_send)
        
        // Impostiamo la flag dei dati salvati a true
        localStorage.setItem('are_graph_data_saved', true)
    }

});

export { socket };