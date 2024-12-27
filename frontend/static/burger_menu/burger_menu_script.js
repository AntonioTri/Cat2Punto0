import {ActionButtonManager} from '../burger_menu/action_button_manager.js';
import { CheckMark } from '../../static/check_mark/check_mark.js';

// Questa classe quando inizializzata gestisce e crea il burger menu con tutte le sue funzioni
// Incapsula anche l'action button manager che
export class BurgerMenuManager{

    // Otteniamo il contesto in cui fare le operazioni
    constructor(container = 'body', checkMark = new CheckMark()){

        // Reference al container di lavoro
        this.container = document.querySelector(container);
        // Reference alla check box
        this.checkMark = checkMark;
        // Richiamo dell'inizializzatore
        this.init();
        

    }

    init(){

        // Creazione del burger menu (Crea anche)
        this.addBurgerMenu();
        // Reference al burger menu
        this.burgerMenu = document.getElementById('burger_menu');
        // Reference al bottone del burger menu
        this.burgerMenuButton = document.getElementById('burger_menu_button');

        // Creazione dei bottoni relativi allo specifico utente tramite il manager adeguato
        // Ne richiamiamo anche il metodo per inizializzare i bottoni
        this.actionButtonManager = new ActionButtonManager();
        this.actionButtonManager.addPersonalActionbuttons();

        // Definiamo la variabile di stato che identifica quando il menu è aperto
        this.opened = false;
        //Aggiunta degli event listener ai componenti così creati
        this.addEventListeners();

    }


    // Funzione per aggiungere il burger menu alla pagina
    addBurgerMenu() {

        // Creiamo il bottone del menu
        const burgerButton = document.createElement('div');
        burgerButton.id = 'burger_menu_button';
        
        // Creiamo le 3 barre all'interno del bottone
        for (let i = 0; i < 3; i++) {
            const bar = document.createElement('div');
            bar.classList.add('bar');
            burgerButton.appendChild(bar);
        }

        // Creiamo il menu a discesa
        const burgerMenu = document.createElement('div');
        burgerMenu.id = 'burger_menu';
        burgerMenu.classList.add('burger_menu');
        
        // Creiamo la lista delle funzioni personali
        const personalFunctions = document.createElement('ul');
        personalFunctions.classList.add('personal_functions');
        
        // Aggiungiamo la lista al menu
        burgerMenu.appendChild(personalFunctions);

        // Aggiungiamo il bottone e il menu al body della pagina
        this.container.appendChild(burgerButton);
        this.container.appendChild(burgerMenu);
 
    }



    addEventListeners(){

        // Aggiungiamo lo script per fare l'animazione del burger menu al clck del bottone
        this.burgerMenuButton.addEventListener('click', () => {
            
            // All'evento click si aprono e si mostrano i burger menu
            // e il role tag
            this.openCloseBurgerMenu();
            this.slideRoleTag();
            

            // Switch della variabile di stato opened
            this.opened = !this.opened;

        });

        // Qui selezioniamo tutti i bottoni di azione creati dall'action button manager
        const actionButtons = document.querySelectorAll('.action_button');

        // Per ogni bottone aggiungiamo l'azione di aggiungere la classe di clicked, riconoscibile dal css
        actionButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Aggiunge la classe `.clicked`
                button.classList.add('clicked');

                // Nascondiamo il burger menu
                this.openCloseBurgerMenu();
                // Nascondo il role tag
                this.slideRoleTag();

                // Switch della variabile
                this.opened = !this.opened;

                // Rimuove la classe `.clicked` dopo che l'animazione è completata (0.2s in questo caso)
                setTimeout(() => {
                    button.classList.remove('clicked');
                }, 200); // 200ms corrisponde alla durata dell'animazione CSS

            });

        });

    }



    // Questa funzione apre e chiude il burger menu in base alla variabile globale che ne conserva lo stato
    openCloseBurgerMenu(){

        // Se il menu non è aperto viene applicato lo spostamento verso l'interno della pagina
        if(!this.opened){
            this.burgerMenu.style.transition = 'transform 1s ease-out';
            this.burgerMenu.style.transform = 'translateX(300px)'; // Sposta l'elemento di 300px a destra
            
            // Posizioniamo il bottone a destra del menu
            const menuRect =  this.burgerMenu.getBoundingClientRect(); // Otteniamo la posizione attuale del menu
            this.burgerMenuButton.style.transition = 'transform 1s ease-in-out';
            this.burgerMenuButton.style.transform = `translateX(${menuRect.width}px)`; // Spostiamo il bottone (menu + 20px)
            // Aggiungiamo la classe clicked al burger button per le animazioni
            this.burgerMenuButton.classList.add('clicked');
            //Si richiama il metodo del card manager per far muovere l'attuale card attiva
            this.actionButtonManager.getCardManager().moveCardToLeft(menuRect.width);
            
            // Altrimenti verso l'esterno
        } else {
            this.burgerMenu.style.transition = 'transform 1s ease-in';
            this.burgerMenu.style.transform = 'translateX(-120px)';
            this.burgerMenuButton.style.transition = 'transform 1s ease-in-out';
            this.burgerMenuButton.style.transform = 'translateX(0px)';
            // Togliamo la classe clicked al burger button per le animazioni
            this.burgerMenuButton.classList.remove('clicked');
            //Si richiama il metodo del card manager per far muovere l'attuale card attiva
            this.actionButtonManager.getCardManager().moveCardToRight();

        }

    }


    
    // Qesta funzione sposta il role tag da una posizione all'altra quando invocata
    slideRoleTag() {

        const roleTag = document.getElementById('role_tag');

        if (!this.opened) {
            // Quando la flag è false, spostiamo il role tag a destra e lo rendiamo invisibile
            roleTag.style.transform = 'translateX(130px)'; // Aggiusta la distanza a destra come preferisci
            roleTag.style.opacity = '0';
        } else {
            // Quando la flag è true, torniamo alla posizione originale e visibilità piena
            roleTag.style.transform = 'translateX(0)';
            roleTag.style.opacity = '1';
        }

    }

}