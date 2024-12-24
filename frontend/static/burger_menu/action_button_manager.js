import {CardManager} from '../admin/card_manager.js';


// Questa classe permette di gestire i bottoni presenti nell'action menu
export class ActionButtonManager{

    constructor(containerSelector = '.personal_functions') {
        // Seleziona il contenitore dove le card saranno aggiunte, di default è il burger_menu
        this.container = document.querySelector(containerSelector);
        
        // Otteniamo anche una reference al card manager per aggiungere la card dedicata 
        // ai bottoni che vengono creati
        this.cardManager = new CardManager();

    }


    // Questo metodo estrae il ruolo dal local storage e crea gli action button
    // Personalizzati per ogni utente, sulla base del ruolo
    addPersonalActionbuttons(){

        // Definiamo le azioni
        const commanderActions = ['Messaggio', 'Nota', 'Permessi'];
        const decritterAction = ['ALPHA', 'BETA', 'OMEGA', 'Chiave'];
        const detectiveActions = ['Deduzione', 'Database', 'Fascicoli'];
        const admin = ['create_team', 'add_team_member', 'reset_passwords'];
        
        // Estraiamo il ruolo
        const role = localStorage.getItem('unformatted_role');

        // Aggiungiamo gli action button sulla base del ruolo
        switch (role) {
            case 'COMANDANTE':
                this.addActionButton(commanderActions);
                break;
            case 'DETECTIVE':
                this.addActionButton(detectiveActions);
                break;
            case 'DECRITTATORE':
                this.addActionButton(decritterAction);
                break;
            case 'ADMIN':
                this.addActionButton(admin);
                break;
            
            // Caso defaul si viene inizializzati come comandante
            default:
                this.addActionButton(commanderActions);
                break;
        }

    }


    // Questo metodo prende in input una lista di azioni e crea i bottoni 
    // specifici nel burger menu, ad ogni bottone corrisponde una card dal card manager
    addActionButton(actionList){

        // Per ogni elemento della lista, estraiamo la scritta
        // E la usiamo per identificare tutti i componenti associati
        actionList.forEach(actionText => {
            
            // Si creano gli elementi
            const li = document.createElement('li');
            const button = document.createElement('button');
            
            // Si aggiungono le caratteristiche
            button.classList.add('action_button');
            button.id = `${actionText}`;
            button.textContent = actionText;

            // Si aggiungono i nodi al DOM
            li.appendChild(button);
            this.container.appendChild(li);
            
            // Aggiungiamo la card dedicata al bottone usando il testo come id
            this.cardManager.addCardWithClassIDAndPosition('action_card', actionText, 50, 50, actionText);
        
        });

        // Richiamiamo la funzione per aggiungere gli on click event ai bottoni
        this.addOpenCloseOnClickEvents();
    }

    // Questo metodo agiunge lo script per chiudere e far aprire le card
    // corrispondenti al bottone
    addOpenCloseOnClickEvents(){

        // Otteniamo la lista dei bottoni
        const actionButtonList = document.querySelectorAll('.action_button');

        // Per ogni bottone aggiungiamo un event listener
        actionButtonList.forEach(button => {
            button.addEventListener('click', () => {

                // Estraiamo l'id dal bottone
                const action_id = button.id;
                // Estraiamo le card possibili
                let actionCards = document.querySelectorAll('.action_card');

                // Prendiamo solo quella che interessa a noi
                actionCards.forEach(element => {
                    
                    // Se l-elemento in questione è quello che ha l'id che cerchiamo viene attivato
                    if (element.id === `${action_id}`) {
                        // Cambio dello stato alla action card per applicarvi le animazioni
                        if (element.classList.contains('inactive')) {
                            element.classList.remove('inactive');
                            element.classList.add('active');
                        }
                    
                    // altrimenti viene disattivato
                    } else {
                        // Cambio dello stato alla action card per applicarvi le animazioni
                        if (element.classList.contains('active')) {
                            element.classList.remove('active');
                            element.classList.add('inactive');
                        }
                    }
                });
            });
        });
    }
}