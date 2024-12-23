 // Aggiungiamo il canvas per fare le animazioni nell'html al documento ch eimporta lo script
        const canvas = document.createElement('canvas');
        // Ne settiamo le dimensioni
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Ed estraiamo il contesto bidimensionale
        const context = canvas.getContext('2d');

        // Andiamo a definire ora l'array delle corde ed il numero delle sfere
        let balls = [];
        let numberOfballs = 45;
        let minimumCordDistance = 130;
        

        // Per ogni sfera creiamo una corda con positioni iniziali randomiche
        for (let i = 0; i < numberOfballs; i++) {
            balls.push({
                x: Math.random() * innerWidth,
                y: Math.random() * innerWidth,
                speedX: (Math.random() - 0.5) * 1.27,
                speedY: (Math.random() - 0.5) * 1.27
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


        function drawBubbles(){
            // Questo for disegna le palline
            for (let index = 0; index < balls.length; index++) {
                let ball = balls[index];
                context.beginPath();
                context.arc(ball.x, ball.y, 5, 0, Math.PI * 2, false);
                context.stroke();
                context.fill();
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
            drawBubbles();
            drawCords();
        }

        // La funzione animate quando chiamata inizia il ciclo di animazione delle palline
        function animate(){
            requestAnimationFrame(animate);
            context.clearRect(0, 0, canvas.width, canvas.height);
            updatePosition();
        }

        animate();