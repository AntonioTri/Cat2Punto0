import { socket } from '../../utils/socket.js';

document.addEventListener('socketInitialized', () => {
    

    socket.on('signal_for_commander', (data) => {
        console.log('Segnale per il comandante ricevuto.', data);
    })


});