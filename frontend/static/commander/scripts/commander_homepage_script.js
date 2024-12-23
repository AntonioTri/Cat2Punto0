
let opened = false;

// Aggiungiamo lo script per fare l'animazione del burger menu al clck del bottone
document.getElementById('burger_menu_button').addEventListener('click', () => {
    const burger_menu = document.getElementById('burger_menu');
    
    // Se il menu non è aperto viene applicato lo spostamento verso l'interno della pagina
    if(!opened){
        burger_menu.style.transition = 'transform 1s ease-out';
        burger_menu.style.transform = 'translateX(450px)'; // Sposta l'elemento di 300px a destra
    
        // Altrimenti verso l'esterno
    } else {
        burger_menu.style.transition = 'transform 1s ease-in';
        burger_menu.style.transform = 'translateX(0px)';
    }

    // Switch della variabile
    opened = !opened;

});
  