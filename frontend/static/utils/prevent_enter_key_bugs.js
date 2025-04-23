document.querySelectorAll('input').forEach(input => {
    input.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            // impedisce invio e spostamenti strani alla pressione del tasto invio
            event.preventDefault(); 
        }
    });

    // forza il punto 0,0 nel caso il bug sia avvenuto semplicemente cliccando sull'input tag
    input.addEventListener('focus', () => {
        window.scrollTo(0, 0); 
    });
    
    
});