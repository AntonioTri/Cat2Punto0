
// Aggiungiamo il canvas per fare le animazioni nell'html al documento che importa lo script
 window.addEventListener('load', function() {
    // Creiamo un elemento di tipo canvas
    const canvas = document.createElement('canvas');

     // Ne settiamo le dimensioni
    canvas.width = window.innerWidth;  
    canvas.height = window.innerHeight;

    // Settiamo l'id del canvas in modo da potervici riferire nel css
    canvas.id = 'neural_background';

    
    // Aggiungiamo il canvas al DOM
    document.body.appendChild(canvas);
    
    // Ed estraiamo il contesto bidimensionale
    const context = canvas.getContext('2d');
    
    // Settiamo l'alpha
    const alpha = 0.2;

    // Andiamo a definire ora l'array delle corde ed il numero delle sfere
    let balls = [];
    let numberOfballs = 20;
    let minimumCordDistance = 130;

    

    // Per ogni sfera creiamo una corda con positioni iniziali randomiche
    for (let i = 0; i < numberOfballs; i++) {
        balls.push({
            x: Math.random() * innerWidth,
            y: Math.random() * innerWidth,
            speedX: (Math.random() - 0.5) * 1.11,
            speedY: (Math.random() - 0.5) * 1.11
        });
    }


    function updatePosition(){
        for (let i = 0; i < balls.length; i++) {
            let ball = balls[i];
            ball.x += ball.speedX;
            ball.y += ball.speedY;
        }

        // Viene eseguito il controllo per l'effetto PacMan
        checkBallHitBorders();

        draw();
    }


    // Questa funzione controlla se le palline hanno raggiunto la fine del canvas
    // In quel caso inverte la direzione del movimento
    function checkBallHitBorders(){

        for (let i = 0; i < balls.length; i++) {
            let ball = balls[i];
            // Se la palla supera un borso laterale viene posizionata sul lato opposto
            if (ball.x > canvas.width + 2) {
                ball.x = -2;
            } else if(ball.x < -2){
                ball.x = canvas.width + 2;
            }

            // La stessa logica viene applicata ai bordi superiori ed inferiori
            if (ball.y > canvas.height + 2) {
                ball.y = -2;
            } else if (ball.y < -2){
                ball.y = canvas.height + 2;
            }

        }
    }


    function drawBubbles() {
        // Questo for disegna le palline
        for (let index = 0; index < balls.length; index++) {
            let ball = balls[index];
            
            // Importante notare ch eper dare l'effetto della corda che si collega
            // ad un bordo invisibile della pallina, gestiamo gli alpha in mood che
            // Le bianche abbiano alpha uguale ad 1 e le nere invece all'alpha desiderto
            
            // Sfera bianca
            context.globalAlpha = 1;
            context.beginPath();
            context.fillStyle = 'white'; // Colore di riempimento bianco
            context.strokeStyle = 'white'; // Colore del contorno bianco
            context.arc(ball.x, ball.y, 6, 0, Math.PI * 2, false);
            context.fill();
            context.stroke();


            // Sfera nera sopra
            context.globalAlpha = alpha;
            context.beginPath();
            context.fillStyle = 'black'; // Colore di riempimento nero
            context.strokeStyle = 'black'; // Colore del contorno nero
            context.arc(ball.x, ball.y, 3, 0, Math.PI * 2, false); // Dimensione più piccola
            context.fill();
            context.stroke();
        }
    }
    

    function drawCords(){

        // Qui invece disegnamo le linee tra le palline
        context.beginPath();
        // Iniziamo a scorrere l'array delle palline.
        // Per ogni pallina andiamo a disegnare una linea verso le altre palline vicine
        for (let i = 0; i < balls.length; i++) {
            let lineStart = balls[i];
            context.moveTo(lineStart.x, lineStart.y);

            // Ciclo for interno che definisce dove disegnare la fine della linea
            for (let j = 0; j < balls.length; j++) {
                if (j !== i && distance(balls[i], balls[j]) < minimumCordDistance) {
                    let lineEnd = balls[j];
                    context.lineTo(lineEnd.x, lineEnd.y);
                }
            }
        }

        context.stroke();

    }

    // Questa funzione serve a capire se due punti sono vicini tra loro
    function distance(point1, point2){

        let deltaX = point1.x - point2.x;
        let deltaY = point1.y - point2.y;
        
        let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        return distance;

    }

    function draw(){
        // Settiamo l'alpha al valore desiderato
        context.globalAlpha = alpha;
        drawCords();
        drawBubbles();
    }

    // La funzione animate quando chiamata inizia il ciclo di animazione delle palline
    function animate(){
        requestAnimationFrame(animate);
        context.clearRect(0, 0, canvas.width, canvas.height);
        updatePosition();
    }

    animate();



});
