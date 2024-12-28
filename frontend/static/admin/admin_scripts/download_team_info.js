import { AbstractCardManager } from '../../utils/abstract_card_manager.js';
import { CheckMark } from '../../check_mark/check_mark.js';

export class DownloadCardManager extends AbstractCardManager{


    constructor(containerSelector = 'download_team', checkMark = new CheckMark()){

        super(containerSelector, checkMark);


    };

    init(){

        // Variabile che conserva i nomi dei team
        this.teamsName = [{team : 'None'}];
        super.addSelector('team_selector', []);
        super.addSubmitButton();

    };


    sendRequest(){

        return;

    };


}

