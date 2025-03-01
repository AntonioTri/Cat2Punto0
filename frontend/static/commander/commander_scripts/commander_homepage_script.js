import { BurgerMenuManager } from "../../burger_menu/burger_menu_script.js";
import { CheckMark } from '../../check_mark/check_mark.js';
import { commanderActions } from '../../utils/constants.js';
import { socket } from '../../utils/socket.js';
import { PermissionManager } from "../../commander/commander_scripts/permission.js";

const checkMark = new CheckMark();

const burgerMenuManager = new BurgerMenuManager('body', checkMark);

const permissionManager = new PermissionManager(commanderActions[2], checkMark, socket);

