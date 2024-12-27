import { BurgerMenuManager } from "../../burger_menu/burger_menu_script.js";
import { admin } from '../../utils/constants.js';

import { CreateTeamManager } from '../../admin/admin_scripts/create_team.js';
import {  } from '../../admin/admin_scripts/add_team_member.js';
import {  } from '../../admin/admin_scripts/reset_passwords.js';

import { CheckMark } from '../../check_mark/check_mark.js';

const checkMark = new CheckMark();

const burgerMenuManager = new BurgerMenuManager('body', checkMark);

const createTeamManager = new CreateTeamManager(admin[0], checkMark);

