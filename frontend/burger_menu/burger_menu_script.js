// Funzione per aggiungere il burger menu alla pagina
function addBurgerMenu() {
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
    
    // Aggiungiamo gli elementi della lista (i pulsanti)
    const actions = ['Action 1', 'Action 2', 'Action 3', 'Action 4'];
    actions.forEach(actionText => {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.classList.add('action_button');
        button.textContent = actionText;
        li.appendChild(button);
        personalFunctions.appendChild(li);
    });
    
    // Aggiungiamo la lista al menu
    burgerMenu.appendChild(personalFunctions);

    // Aggiungiamo il bottone e il menu al body della pagina
    document.body.appendChild(burgerButton);
    document.body.appendChild(burgerMenu);
}

// Chiamiamo la funzione per aggiungere gli elementi
addBurgerMenu();



// Script per aggiungere le interazioni con il burger menu

let opened = false;
const burger_menu = document.getElementById('burger_menu');
const burger_button = document.getElementById('burger_menu_button')

// Aggiungiamo lo script per fare l'animazione del burger menu al clck del bottone
burger_button.addEventListener('click', () => {
    
    openCloseBurgerMenu();

});
  
// Qui selezioniamo tutti i bottoni di azione
const actionButtons = document.querySelectorAll('.action_button');

// Per ogni bottone aggiungiamo l'azione di aggiungere la classe di clicked, riconoscibile dal css
actionButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Aggiunge la classe `.clicked`
        button.classList.add('clicked');

        // Nascondiamo il burger menu
        openCloseBurgerMenu();

        // Rimuove la classe `.clicked` dopo che l'animazione è completata (0.2s in questo caso)
        setTimeout(() => {
            button.classList.remove('clicked');
        }, 200); // 200ms corrisponde alla durata dell'animazione CSS
    });
});


// Questa funzione apre e chiude il burger menu in base alla variabile globale che ne conserva lo stato
function openCloseBurgerMenu(){

    // Se il menu non è aperto viene applicato lo spostamento verso l'interno della pagina
    if(!opened){
        burger_menu.style.transition = 'transform 1s ease-out';
        burger_menu.style.transform = 'translateX(300px)'; // Sposta l'elemento di 300px a destra
        
        // Posizioniamo il bottone a destra del menu
        const menuRect = burger_menu.getBoundingClientRect(); // Otteniamo la posizione attuale del menu
        burger_button.style.transition = 'transform 1s ease-in-out';
        burger_button.style.transform = `translateX(${menuRect.width}px)`; // Spostiamo il bottone (menu + 20px)
        // Aggiungiamo la classe clicked al burger button per le animazioni
        burger_button.classList.add('clicked');

    // Altrimenti verso l'esterno
    } else {
        burger_menu.style.transition = 'transform 1s ease-in';
        burger_menu.style.transform = 'translateX(-300px)';
        burger_button.style.transition = 'transform 1s ease-in-out';
        burger_button.style.transform = 'translateX(0px)';
        // Togliamo la classe clicked al burger button per le animazioni
        burger_button.classList.remove('clicked');
    }

    // Switch della variabile
    opened = !opened;


}