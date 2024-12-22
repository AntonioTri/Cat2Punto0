const labels = document.querySelectorAll('.label');

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotation = { x: 0, y: 0 };
let force = 3;
let radius = 70;

// Inizializza le posizioni
labels.forEach(label => {
    const rect = label.getBoundingClientRect();
    label.style.top = `${rect.top}px`;
    label.style.left = `${rect.left}px`;
    label.style.position = 'absolute'; // Assicura che i valori top/left funzionino
});

// Eventi per rotazione
document.addEventListener('mousedown', (e) => {
    isDragging = true;
    
});

labels.forEach((lable) => {

    lable.addEventListener('mousedown', (e) => {

        isDragging = true;
        lable.style.cursor = 'grabbing';
        offset = {
            x: e.clientX - lable.getBoundingClientRect().left,
            y: e.clientY - lable.getBoundingClientRect().top
        };
    });
});


labels.forEach((lable) => {

    lable.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const x = e.clientX - offset.x;
        const y = e.clientY - offset.y;

        lable.style.left = `${x}px`;
        lable.style.top = `${y}px`;


    });

});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

document.addEventListener('mouseleave', () => {
    isDragging = false;
});


// Funzione per aggiornare le posizioni delle scritte
// Funzione per aggiornare le posizioni delle scritte
function applyForces() {

    // Calcoliamo un array delle posizioni, restituisco un dizionario
    // contenente l'elemento e la sua posiione x ed y
    const positions = Array.from(labels).map(label => {

        const rect = label.getBoundingClientRect();
        return {
            element: label,
            x: rect.left + rect.width/2,
            y: rect.top + rect.height/2
        };

    });

    // Calcoliamo le forze
    positions.forEach((pointA, i) => {

        let forceX = 0;
        let forceY = 0;

        positions.forEach((pointB, j) => {

            if (i !== j) {
                const dx = pointA.x - pointB.x;
                const dy = pointA.y - pointB.y;
                const distance = Math.sqrt(dx*dx + dy+dy);

                if(distance < radius && distance > 0){
                    forceX += (dx/distance) * force;
                    forceY += (dx/distance) * force;
                }
            }
        });

        const element = pointA.element;
        const currentTop = parseFloat(element.style.top);
        const currentLeft = parseFloat(element.style.left);
        element.style.top = `${Math.min(Math.max(currentTop + forceY, 0), window.innerHeight - element.offsetHeight )}px`
        element.style.left = `${Math.min(Math.max(currentLeft + forceX, 0), window.innerWidth - element.offsetWidth )}px`

    });

}

function animate(){
    applyForces();
    requestAnimationFrame(animate);
}


animate()
