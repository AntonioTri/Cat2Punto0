import { AbstractCardManager } from '../../utils/abstract_card_manager.js';
import { CheckMark } from '../../check_mark/check_mark.js';

export class DownloadCardManager extends AbstractCardManager{


    constructor(containerSelector = 'download_team', checkMark = new CheckMark()){

        super(containerSelector, checkMark);


    };

    init(){

        super.addSelector('team_selector', []);
        super.addInputTag('username');
        super.addResponseMessage();
        super.addSubmitButton();
        this.apiMessage.innerHTML = 'MAMMT';

    };


    sendRequest(){

        return;

    };


}

