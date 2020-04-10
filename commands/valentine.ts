import { Character, VALENTINES } from "../objects/character";
import { getRandomInt } from "../helper";

function getValentine(): Character {
    return VALENTINES[getRandomInt(0, VALENTINES.length)];
}

export default getValentine;