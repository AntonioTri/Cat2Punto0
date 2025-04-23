import { socket } from '../../utils/socket.js';
import { CheckMark } from '../../check_mark/check_mark.js';
import { AbstractCardManager } from '../../utils/abstract_card_manager.js';

export class ReservedEvidencesManager extends AbstractCardManager {

    constructor(containerSelector = 'Prove', checkMark = new CheckMark()){

        super(containerSelector, checkMark);

    };


    init(){

        this.reserved = [];

        this.addScrollableList('reserved_evidence_list');
        this.addSocketListener();
        this.askCacheData("retrieve_evidences");
        this.addLocker("Prove");


    };

    addSocketListener(){
        socket.on('add_new_reserved_evidence', (evidence) => {
            this.addElementToList(evidence);
        });
    };


    // All'invocazione, viene aggiunta la nuova prova alla lista
    addElementToList(evidence){

        // Aggiunta dell'elemento
        const elementAdded = this.addElementToScrollableList(`${evidence.id_evidence}`, evidence.title);

        // Aggiunta dell'event listener
        elementAdded.addEventListener('click', () => {
            this.evidenceManager.showCard(evidence.title, evidence.content);
        });

    };

}