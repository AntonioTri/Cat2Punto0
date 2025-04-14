import { socket } from '../../utils/socket.js';
import { BurgerMenuManager } from "../../burger_menu/burger_menu_script.js";
import { CrypterManager } from "../../decripter/decripter_scripts/crypting_system.js";
import { decritterAction } from "../../utils/constants.js";
import { CheckMark } from '../../check_mark/check_mark.js';

const checkMark = new CheckMark();

const burgerMenuManager = new BurgerMenuManager('body', checkMark);

document.addEventListener("socketInitialized", () => {

    const crypterManager = new CrypterManager(decritterAction[3], checkMark);

})