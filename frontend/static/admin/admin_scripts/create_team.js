// Questa classe quando importata inizializza la pagina del create team

export class CreateTeamManager{

    // Il costruttore definisce come container di lavoro la pagina del create team
    constructor(containerSelector = 'create_team'){ 

        this.container = document.getElementById(containerSelector);
        this.init();

    }

    // La funzione init inizializza tutta la pagina e ne associa le funzionalità
    init(){



    }


}