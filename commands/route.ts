import { Character, CHARACTERS } from '../objects/character';
import { getRandomInt } from '../helper';

function getNextRoute(): Character {
    return CHARACTERS[getRandomInt(0, CHARACTERS.length)];
}

export default getNextRoute;