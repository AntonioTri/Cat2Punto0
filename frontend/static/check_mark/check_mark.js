import { CardManager } from '../admin/card_manager.js';


// Questa classe gestisce la creazione e le funzionalità del check mark
// che compare ed esegue animazioni in modo autonomo, basta solo invocare i metodi
export class CheckMark{


    constructor(containerSelector = 'body'){

        // Seleziona il contenitore dove il check mark sarà aggiunto, di default è il <body>
        this.container = document.querySelector(containerSelector);
        this.cardManager = new CardManager();
        this.init();

        this.cardManager = null;
        this.canBeShown = true;

    }


    // La funzione init inizializza la card, le posizioni ed aggiunge i div per le animazioni
    init(){

        // Viene aggiunta la card al body
        this.cardManager.addCardWithClassIDAndPositionNoChild('check_box', 'check_box', 0, 105);
        this.checkMark = document.querySelector("#check_box.check_box");
        // Settiamo i tempi per tutte le animazioni in millisecondi
        this.popUoutTime = 500;
        this.canvasAnimationTime = 600; 
        this.timeToElapse = 2000;

        // Inizializziamo le proprietà degli elementi
        this.setProperty();


    }


    success() {

        // Se il bottone non si puo mostrare la funzione ritorna
        if (!this.canBeShown) return;
        // Altrimenti prosegue e come prima cosa viene impedita una nuova animazione
        this.canBeShown = false;

        this.canvas.style.backgroundColor = 'rgb(109, 196, 23)';
        this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);

        //Breve pausa per la ricalcolazione del layout prima della transizione
        setTimeout(() => {
            // Avvio la transizione
            this.checkMark.style.left = '75%';
        }, 10);
    
        // Esegui il disegno dell'animazione di successo dopo la fine della transizione
        this.checkMark.addEventListener('transitionend', () => {
            this.showGreenCheckMark(); // Animazione della spunta verde
        });
        
        // Esegui il timer per rimuovere la card
        setTimeout(() => {
            this.checkMark.style.left = '105%';
        }, this.timeToElapse + this.canvasAnimationTime + this.popUoutTime);
        
        // Puliamo il canvas dopo che è stato nascosto
        setTimeout(() => {
            this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
            // viene reimpostata la possibilità di comparire
            this.canBeShown = true;
        }, this.timeToElapse + this.canvasAnimationTime + this.popUoutTime * 2);
    }
    


    error(){

        // Se il bottone non si puo mostrare la funzione ritorna
        if (!this.canBeShown) return;
        // Altrimenti prosegue e come prima cosa viene impedita una nuova animazione
        this.canBeShown = false;

        this.canvas.style.backgroundColor = 'rgb(219, 35, 35)';
        this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);

        //Breve pausa per la ricalcolazione del layout prima della transizione
        setTimeout(() => {
            // Avvio la transizione
            this.checkMark.style.left = '75%';
        }, 10);
    
        // Esegui il disegno dell'animazione di successo dopo la fine della transizione
        this.checkMark.addEventListener('transitionend', () => {
            this.showRedCheckMark(); // Animazione della spunta verde
        });
        
        // Esegui il timer per rimuovere la card
        setTimeout(() => {
            this.checkMark.style.left = '105%';
        }, this.timeToElapse + this.canvasAnimationTime + this.popUoutTime);
        
        // Puliamo il canvas dopo che è stato nascosto
        setTimeout(() => {
            this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
            // viene reimpostata la possibilità di comparire
            this.canBeShown = true;
        }, this.timeToElapse + this.canvasAnimationTime + this.popUoutTime * 2);
    }


    showGreenCheckMark() {
        // Assicurati che il canvas sia correttamente inizializzato
        const canvas = this.canvas;
        const context = canvas.getContext('2d');
    
        // Funzione per l'effetto easeOutQuad
        function easeOutQuad(t) {
            return 1 - (1 - t) * (1 - t); // Curva di interpolazione ease-out
        }
    
        // Funzione per l'animazione della "V"
        function animateCheckMarkGreen(duration) {
            let startTime = null;
    
            // Punti della "V"
            const points = [
                { x: (canvas.width / 10) * 2.6, y: canvas.height / 2 }, // Inizio
                { x: (canvas.width / 2) * 0.93 , y: canvas.height - canvas.height / 4 }, // Punto basso della "V"
                { x: canvas.width - (canvas.width / 4) * 1.1 , y: (canvas.height / 4) * 1.1 }, // Fine
            ];
    
            // Funzione per disegnare il frame
            function drawFrame(timestamp) {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
    
                // Calcola la progressione (tra 0 e 1) con easing
                const progress = easeOutQuad(Math.min(elapsed / duration, 1));
    
                // Pulisce il canvas
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.beginPath();
                context.strokeStyle = 'white';
                context.lineWidth = 8;
                context.lineCap = 'round';
                context.lineJoin = 'round'; // Arrotonda gli spigoli
    
                // Disegna la "V" in base al progresso dell'animazione
                if (progress < 0.5) {
                    // Disegna solo il primo segmento
                    const segmentProgress = progress / 0.5; // Interpolazione per il primo segmento
                    const currentX = points[0].x + (points[1].x - points[0].x) * segmentProgress;
                    const currentY = points[0].y + (points[1].y - points[0].y) * segmentProgress;
                    context.moveTo(points[0].x, points[0].y);
                    context.lineTo(currentX, currentY);
                } else {
                    // Disegna il primo segmento completo
                    context.moveTo(points[0].x, points[0].y);
                    context.lineTo(points[1].x, points[1].y);
    
                    // Disegna il secondo segmento
                    const segmentProgress = (progress - 0.5) / 0.5; // Interpolazione per il secondo segmento
                    const currentX = points[1].x + (points[2].x - points[1].x) * segmentProgress;
                    const currentY = points[1].y + (points[2].y - points[1].y) * segmentProgress;
                    context.lineTo(currentX, currentY);
                }
    
                context.stroke();
    
                // Se l'animazione non è completata, richiama il frame successivo
                if (progress < 1) {
                    requestAnimationFrame(drawFrame);
                }
            }
    
            // Avvia l'animazione
            requestAnimationFrame(drawFrame);
        }
    
        // Esegui l'animazione quando viene chiamata la funzione
        animateCheckMarkGreen(this.canvasAnimationTime);
    }
    

    showRedCheckMark() {
        // Assicurati che il canvas sia correttamente inizializzato
        const canvas = this.canvas;
        const context = canvas.getContext('2d');
    
        // Funzione per l'effetto easeOutQuad
        function easeOutQuad(t) {
            return 1 - (1 - t) * (1 - t); // Curva di interpolazione ease-out
        }
    
        // Funzione per l'animazione della "V"
        function animateCheckMarkRed(duration) {
            let startTime = null;
        
            // Punti della "X"
            const points = [
                { x: (canvas.width / 4) * 1.1,  y: (canvas.height / 4) * 1.1 }, // Inizio prima barra
                { x: (canvas.width / 4) * 2.95, y: (canvas.height - canvas.height / 4) * 0.95 }, // Fine prima barra
                { x: (canvas.width / 4) * 1.1,  y: (canvas.height - canvas.height / 4) * 0.95 }, // Inizio seconda barra
                { x: (canvas.width / 4) * 2.95, y: (canvas.height / 4) * 1.1 },  // Fine seconda barra
            ];
        
            function drawFrame(timestamp) {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
        
                // Calcola la progressione (tra 0 e 1) con easing
                const progress = easeOutQuad(Math.min(elapsed / duration, 1));
        
                // Pulisce il canvas
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.beginPath();
                context.strokeStyle = 'white';
                context.lineWidth = 8;
                context.lineCap = 'round';
                context.lineJoin = 'round'; // Arrotonda gli spigoli
        
                // Disegna il primo segmento (prima barra della X)
                if (progress <= 0.5) {
                    const segmentProgress = progress / 0.5; // Interpolazione per il primo segmento
                    const currentX = points[0].x + (points[1].x - points[0].x) * segmentProgress;
                    const currentY = points[0].y + (points[1].y - points[0].y) * segmentProgress;
                    context.moveTo(points[0].x, points[0].y);
                    context.lineTo(currentX, currentY);
                } else {
                    // Disegna il primo segmento completo
                    context.moveTo(points[0].x, points[0].y);
                    context.lineTo(points[1].x, points[1].y);
        
                    // Disegna il secondo segmento (seconda barra della X)
                    const segmentProgress = (progress - 0.5) / 0.5; // Interpolazione per il secondo segmento
                    const currentX = points[2].x + (points[3].x - points[2].x) * segmentProgress;
                    const currentY = points[2].y + (points[3].y - points[2].y) * segmentProgress;
                    context.moveTo(points[2].x, points[2].y); // Assicurati che la linea parta dal punto corretto
                    context.lineTo(currentX, currentY);
                }
        
                context.stroke();
        
                // Se l'animazione non è completata, richiama il frame successivo
                if (progress < 1) {
                    requestAnimationFrame(drawFrame);
                }
            }
        
            requestAnimationFrame(drawFrame);
        }
        
    
        // Esegui l'animazione quando viene chiamata la funzione
        animateCheckMarkRed(this.canvasAnimationTime);
    }


    // Questa funzione setta le proprietà del checkcontainer dinamicamente
    // rispetto alla card, per rendere tutto dinamico
    setProperty(){
        
        // Settiamo dei valori di default per l'estetca
        this.checkMark.style.top = '0%';
        this.checkMark.style.left = '105%';
        this.checkMark.style.height = '56px';
        this.checkMark.style.marginTop = '9px';
        this.checkMark.style.padding = '1%';
        this.checkMark.style.alignItems = 'center';
        this.checkMark.style.justifyContent = 'center';
        
        // Aggiungi le componenti interne
        this.checkContainer = document.createElement('div');
        this.checkContainer.id = 'check_mark_container';
        this.checkMark.appendChild(this.checkContainer);

        // Dopo che l'elemento è stato aggiunto al DOM
        requestAnimationFrame(() => {
            // Ottieni altezza
            const height = this.checkMark.getBoundingClientRect().height * 0.8;
            this.checkContainer.style.height = `${height}px`;
            this.checkContainer.style.width = `${height}px`;

            // Posiziona verticalmente al centro e orizzontalmente alla distanza desiderata
            this.checkContainer.style.position = 'absolute';
            this.checkContainer.style.top = '50%'; // Centro verticale
            this.checkContainer.style.left = '4%'; // Distanza fissa dalla sinistra (10%)
            this.checkContainer.style.transform = 'translateY(-50%)'; // Centra rispetto all'altezza
            
            let canvas = document.createElement('canvas');
            canvas.id = 'check_mark_canvas';
            canvas.width = this.checkContainer.getBoundingClientRect().width; // Imposta larghezza interna
            canvas.height = this.checkContainer.getBoundingClientRect().height; // Imposta altezza interna

            // Aggiungi il canvas al container
            this.checkContainer.appendChild(canvas);
            this.canvas = canvas

        });


        
    }

}


