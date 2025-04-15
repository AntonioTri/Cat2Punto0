import { SOCKET_URL } from "../../static/config.js";

const socket = io(SOCKET_URL, {
    // Disabilita polling, usa solo WebSocket
    transports: ["websocket"],
    auth: { token: localStorage.getItem("access_token") }
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
    

    // Con questo segnale andiamo a conservare in local storage tutte le informazioni del grafo che ci vengono inviate

    // Se la variabile non esiste allora la creiamo
    let graph_data = localStorage.getItem('graph_data')
    // Se i dati esistono vi aggiungiamo i nuovi dati ricevuti
    if (graph_data) {
        // Eseguiamo un parse sulla stringa per trasformarla in oggetto
        graph_data = JSON.parse(graph_data);
        //Settiamo la nuova chiave
        graph_data[data.key] = data.link_to_source;
        // Riconvertiamo in stranga i dati
        graph_data = JSON.stringify(graph_data);
        // E li reinseriamo al local storage
        localStorage.setItem('graph_data', graph_data);
    
    // Nel caso contrario, graph_data non esiste, pertanto la creiamo prima, poi
    // Eseguiamo il parse die dati e li inseriamo a localstorage
    } else {
        
        // Estraiamo i dati
        const key = data.key;
        const link = data.link_to_source;
        // Creiamo l'istanza
        let savings_first_instance = {key : link };
        // Parse e memorizzazione
        savings_first_instance = JSON.stringify(savings_first_instance);
        localStorage.setItem('graph_data', savings_first_instance);
    }

});

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


// document.addEventListener('socketInitialized', () => {
//     // Esegui azioni specifiche dopo il caricamento
//     const are_graph_data_saved = localStorage.getItem('are_graph_data_saved')
    
//     // TODO: Bisognerebbe fare un controllo per definire se richiedere nuovi dati in quanto puo'
//     // esserci stato un cambiamento durante il ricaricamento della pagina, nuove scoperte
//     // In sostanza se qualcuno esce e poi rientra oppure ricarica e nel frattempo nuove scoperte vengono fatte
//     // queste devono essere inviate

//     // Nel caso in cui non ci siano dati salvati, allora richiediamo alla API di mandarli
//     if (!are_graph_data_saved) {
//         console.log('Socket inizializzata: Richiedo i dati di salvataggio ...');
//         // Definiamo i dati da mandare
//         const data_to_send = {
//             personal_id : localStorage.getItem('personal_id'),
//             team_id : localStorage.getItem('team_id'),
//             socket : localStorage.getItem('socket')
//         }

//         socket.emit('get_save_data', data_to_send)
        
//         // Impostiamo la flag dei dati salvati a true
//         localStorage.setItem('are_graph_data_saved', true)
//     }

// });

export { socket };