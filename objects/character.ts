import characters = require('../database/routes.json');
import valentines = require('../database/valentines.json');
import { hexStringToInt } from '../helper';

export class Character {
    private _name: string;
    private _description: string;
    private _age: number;
    private _birthday: string;
    private _animal: string;
    private _color: number;
    private _emojiId: string;

    constructor(name: string, age: number, description?: string, birthday?: string,
        animal?: string, color?: number, emojiId?: string) {
        this._name = name;
        this._description = description;
        this._age = age;
        this._birthday = birthday;
        this._animal = animal;
        this._color = color;
        this._emojiId = emojiId;
    }

    getName() {
        return this._name;
    }

    getFirstName() {
        return this._name.split(/\s+/g)[0];
    }

    getDescription() {
        return this._description;
    }

    getAge() {
        return this._age;
    }

    getBirthday() {
        return this._birthday;
    }

    getAnimal() {
        return this._animal;
    }

    getColor() {
        return this._color;
    }

    getEmojiId() {
        return this._emojiId;
    }

    getEmojiUrlGif() {
        return `https://cdn.discordapp.com/emojis/${this._emojiId}.gif?v=1`;
    }

    getEmojiUrlPng() {
        return `https://cdn.discordapp.com/emojis/${this._emojiId}.png?v=1`;
    }
}

export let CHARACTERS = new Array<Character>();
export let VALENTINES = new Array<Character>();

export function initializeCharacters() {
    for (let character of characters) {
        CHARACTERS.push(new Character(
            character.name, character.age, character.description,
            character.birthday, character.animal, hexStringToInt(character.color),
            character.emoteId
        ));
    }

    for (let valentine of valentines) {
        VALENTINES.push(new Character(
            valentine.name, valentine.age, valentine.description,
            valentine.birthday, valentine.animal, hexStringToInt(valentine.color),
            valentine.emoteId
        ));
    }
}

export const ENDINGS = ["Perfect", "Good", "Bad", "Worst"];