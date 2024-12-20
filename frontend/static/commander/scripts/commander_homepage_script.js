const sphere = document.querySelector('.sphere');
const points = document.querySelectorAll('.point');
const labels = document.querySelectorAll('.label');

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotation = { x: 0, y: 0 };

// Eventi per rotazione
document.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    rotation.x -= deltaY * 0.1;
    rotation.y += deltaX * 0.1;

    sphere.style.transform = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;

    previousMousePosition = { x: e.clientX, y: e.clientY };

    console.log(`Mouse position = ${previousMousePosition.x}, ${previousMousePosition.y}`);
    updateLabels();
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

document.addEventListener('mouseleave', () => {
    isDragging = false;
});

// Funzione per aggiornare le posizioni delle scritte
function updateLabels() {
    labels.forEach((label, index) => {
        const point = points[index];

        // Ottieni il rettangolo del punto dopo la trasformazione
        const rect = point.getBoundingClientRect();
        
        // Calcola la posizione corretta relativa al contenitore della sfera
        const sphereRect = sphere.getBoundingClientRect(); // Ottieni la posizione della sfera nel documento
        const x = rect.left - sphereRect.left + rect.width / 2; // Calcola la posizione relativa al contenitore
        const y = rect.top - sphereRect.top + rect.height / 2;  // Calcola la posizione relativa al contenitore

        // Posiziona la scritta in base alle coordinate ottenute
        label.style.left = `${x}px`;
        label.style.top = `${y}px`;

        console.log(`Label Position: Left: ${x} .Top: ${y}`);
    });
}

updateLabels();
