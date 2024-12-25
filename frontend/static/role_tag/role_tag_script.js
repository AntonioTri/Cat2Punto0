// Questa funzione aggiunge gli elementi del tag nella pagina
function addRoleTag(){

    // Creiamo il role tag che mostra il ruolo attualmente loggato
    const roleTag = document.createElement('div');
    roleTag.id = 'role_tag';

    // Creiamo le due righe di testo, una che mostra una scritta standard
    // ed una che mostra il ruolo
    const standardPhrase = document.createElement('div');
    const innerRole = document.createElement('div');

    // Aggiungiamo i div delle stringhe al role TAG
    roleTag.appendChild(standardPhrase);
    roleTag.appendChild(innerRole);

    // Prendiamo la scritta dal local storage
    let role = localStorage.getItem('unformatted_role');
    
    // Aggiungiamo il testo alla frase standard, definiamo anche l'id
    standardPhrase.textContent = 'Accesso come:';
    standardPhrase.id = 'standard_phrase';
    // Aggiungiamo il testo al ruolo interno al tag
    innerRole.textContent = `${role}`;
    innerRole.id = 'inner_role';

    // Aggiungiamo al documento il role tag
    document.body.appendChild(roleTag);

}



// Richiamo alla funzione per aggiungere gli elementi allo script
addRoleTag();