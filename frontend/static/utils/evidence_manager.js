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
        // Creiamo la card tramite il manager associato
        let evidenceCard = this.cardManager.addCardWithClassIDAndTitle('x', 'evidence_card', title, content);
        
        // Rimuovi la classe 'x' (predefinita) e assegna lo stato iniziale
        evidenceCard.classList.remove('x');

        // Settaggio della giusta distanza dal bordo superiore
        evidenceCard.style.top = '7%';
    
        // Forziamo lo stato iniziale (senza animazione, come definito nel CSS)
        evidenceCard.classList.add('evidence_inactive');
    
        // Aggiungiamo un piccolo timeout per consentire al browser di "settare" lo stato iniziale
        setTimeout(() => {
            evidenceCard.classList.remove('evidence_inactive'); // Rimuovi lo stato iniziale
            evidenceCard.classList.add('evidence_active');     // Applica lo stato attivo (animazione inizia)
        }, 10);
    
        // Aggiungiamo l'evento `click` per la rimozione
        evidenceCard.addEventListener('click', () => {
            // Cambia lo stato a "inactive" per attivare l'animazione di scomparsa
            evidenceCard.classList.remove('evidence_active');
            evidenceCard.classList.add('evidence_inactive');
    
            // Timeout prima della rimozione (tempo della transizione)
            setTimeout(() => {
                evidenceCard.remove();
            }, 500);
        });
    }
    







}