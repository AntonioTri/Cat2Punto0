import { AbstractCardManager } from '../../utils/abstract_card_manager.js';
import { CheckMark } from '../../check_mark/check_mark.js';
import { API_URL, SOCKET_URL } from '../../config.js';


export class FascicoliManager extends AbstractCardManager{


    constructor(containerSelector = 'Fascicoli', checkMark = new CheckMark()){
        super(containerSelector, checkMark);
    }

    init(){

        this.setURLS();
        this.addScrollableList('evidence_list');
        for (let i = 0; i < 40; i++) {
            this.addElementToScrollableList(`item-${i}`, `Elemento ${i + 1}`);
        }
        

    }


    setURLS(){

        // URL per ottenere i fascicoli sbloccati
        this.URL_GET_EVIDENCE = `${API_URL}/get_evidence`;
        // URL per inviare i segnali streaming
        this.URL_ASK_FOR_PERMISSION = `${SOCKET_URL}`;

        // URL docker per ottenere i fascicoli sbloccati 
        this.dockerPathGetEvidence = 'http://localhost:5000/api/get_evidence';
        // URL docker per inviare i segnali
        this.dockerPathSendSignals = 'http://localhost:5000/socket';

    }

}





