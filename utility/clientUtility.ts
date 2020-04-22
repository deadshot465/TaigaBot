import * as Discord from 'discord.js';
import { getRandomInt } from './helper';
import Axios from 'axios';

const SPECIALIZED_CHANCE = 25;
const BACKGROUNDS = [
    "bath", "beach", "cabin", "camp",
    "cave", "forest", "messhall"
];

export default class ClientUtility {
    
    static async randomMsgHandler(message: Discord.Message) {

        const content = message.content.toLowerCase();

        if (content.includes('keitaro')) {
            if (this.isSpecialized()) {
                message.channel.send(`What's your problem with my boyfriend?`);
                return;
            }
        }
        //else if (content.includes('hiro')) {
        //    if (this.isSpecialized()) {
        //        const background = BACKGROUNDS[getRandomInt(0, BACKGROUNDS.length)];
        //        const response = await Axios.post('https://yuuto.dunctebot.com/dialog',
        //            { background, `hiro`, text }, {
        //            responseType: 'arraybuffer',
        //            headers: {
        //                'Accept': 'application/json',
        //                'Content-Type': 'application/json'
        //            }
        //        });
        //    }
        //}
    }

    private static isSpecialized() {
        return getRandomInt(0, 100) < SPECIALIZED_CHANCE;
    }
}