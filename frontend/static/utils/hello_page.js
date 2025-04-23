import { AbstractCardManager } from '../utils/abstract_card_manager.js';
import { welcomeCommander, welcomeDecritter, welcomeDetective } from '../utils/constants.js';

export class HelloPageManager extends AbstractCardManager{


    constructor(containerSelector = 'ciao_hello', checkMark){
        super(containerSelector, checkMark);
        this.container.style.overflow = 'auto';
        this.container.style.scrollBehavior = 'smooth';
    }

    init(){

        const role = localStorage.getItem("unformatted_role");

        switch (role) {
            case "DECRITTATORE":
                this.container.innerHTML = welcomeDecritter;
                break;
            case "COMANDANTE":
                this.container.innerHTML = welcomeCommander;
                break;
            case "DETECTIVE":
                this.container.innerHTML = welcomeDetective;
                break;
        
            default:
                break;
        }

    };

}