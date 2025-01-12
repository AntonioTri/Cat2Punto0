import { BurgerMenuManager } from "../../burger_menu/burger_menu_script.js";
import { CheckMark } from '../../check_mark/check_mark.js';
import { commanderActions } from '../../utils/constants.js';
import { socket } from '../../utils/socket.js';

const checkMark = new CheckMark();

const burgerMenuManager = new BurgerMenuManager('body', checkMark);


socket.on('permission_required_for_file', (data) => {

    console.log("Messaggio dalla socket ricevuto: ", data);

});
