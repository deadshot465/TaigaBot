import * as oracles from '../database/oracles.json';
import { getRandomInt } from '../helper';

export class Oracle {
    public No: number;
    public Fortune: string;
    public Meaning: string;
    public Content: string;

    constructor(no: number, fortune: string, meaning: string, content: string) {
        this.No = no;
        this.Fortune = fortune;
        this.Meaning = meaning;
        this.Content = content;
    }
}

export function getOracle(): Oracle {
    let draw = oracles[getRandomInt(0, oracles.length)];
    return new Oracle(draw.no, draw.fortune, draw.meaning, draw.content);
}