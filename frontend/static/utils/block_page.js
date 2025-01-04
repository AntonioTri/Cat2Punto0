// Salva le dimensioni iniziali del viewport
const startingDimensions = {
    width: window.innerWidth,
    height: window.innerHeight
};

// Funzione per resettare la posizione
function resetPosition() {
    // Ottieni le attuali dimensioni del viewport
    const currentDimensions = {
        width: window.innerWidth,
        height: window.innerHeight
    };

    // Se le dimensioni cambiano (scroll o zoom), riporta alla posizione iniziale
    if (
        currentDimensions.height !== startingDimensions.height ||
        currentDimensions.width !== startingDimensions.width
    ) {
        window.scrollTo(0, 0);
    }
}

// Event listener per touch e scroll
window.addEventListener('touchmove', resetPosition, { passive: false });
window.addEventListener('scroll', resetPosition);
