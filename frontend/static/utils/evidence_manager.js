import { CardManager } from "../admin/card_manager.js";


// Questa classe gestisce i pop up di quando una evidence, file, o prova viene mostrata a schermo
// 
export class EvidenceManager{


    constructor(containerSelector = 'body'){
        this.cardManager = new CardManager();
        this.container = document.querySelector(containerSelector);
        
    }


    // Metodo che crea la carta, aggiungendo l'evento di scomparsa e cancellazione al tocco
    showCard(title, content) {
        // === CREAZIONE OVERLAY CON FADE-IN ===
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        overlay.style.zIndex = '100';
        overlay.style.opacity = '0'; // Inizialmente trasparente
        overlay.style.transition = 'opacity 0.3s ease'; // Transizione graduale

        document.body.appendChild(overlay);

        // Trigger del fade-in con timeout asincrono
        requestAnimationFrame(() => {
            overlay.style.opacity = '1'; // Opacità piena
        });

        // Creiamo la card tramite il manager associato
        let evidenceCard = this.cardManager.addCardWithClassIDAndTitle('x', 'evidence_card', title, content);

        // Rimuovi la classe 'x' (predefinita) e assegna lo stato iniziale
        evidenceCard.classList.remove('x');

        // Settaggio della giusta distanza dal bordo superiore
        evidenceCard.style.top = '7%';
        evidenceCard.style.zIndex = '101'; // Sopra l’overlay

        // Forziamo lo stato iniziale (senza animazione, come definito nel CSS)
        evidenceCard.classList.add('evidence_inactive');

        // Aggiungiamo un piccolo timeout per consentire al browser di "settare" lo stato iniziale
        setTimeout(() => {
            evidenceCard.classList.remove('evidence_inactive');
            evidenceCard.classList.add('evidence_active');
        }, 10);

        // === Aggiungiamo una X per chiudere la card ===
        const closeBtn = document.createElement('div');
        closeBtn.innerText = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '5px';
        closeBtn.style.right = '15px';
        closeBtn.style.fontSize = '50px';
        closeBtn.style.color = '#ffa200';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.zIndex = '102';

        evidenceCard.appendChild(closeBtn);

        // Aggiungiamo l'evento `click` SOLO sulla X per la rimozione
        closeBtn.addEventListener('click', () => {
            // Cambia lo stato a "inactive" per attivare l'animazione di scomparsa
            evidenceCard.classList.remove('evidence_active');
            evidenceCard.classList.add('evidence_inactive');

            // Attiviamo il fade-out dell’overlay
            overlay.style.opacity = '0';

            // Timeout prima della rimozione (tempo della transizione)
            setTimeout(() => {
                evidenceCard.remove();
                overlay.remove(); // Rimuove anche lo sfondo nero
            }, 500); // deve combaciare col tempo di transizione della card
        });


}



    







}