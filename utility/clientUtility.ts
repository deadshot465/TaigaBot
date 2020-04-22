// Copyright(C) 2020 Tetsuki Syu
// See bot.ts for the full notice.

import Axios from 'axios';
import * as Discord from 'discord.js';
import Image from '../commands/image';
import * as randomMessages from '../storage/randomMessages.json';
import { RANDOM_RESPONSES } from '../storage/reactions';
import { getRandomInt } from './helper';

const SPECIALIZED_CHANCE = 50;
const BACKGROUNDS = [
    "bath", "beach", "cabin", "camp",
    "cave", "forest", "messhall"
];

export default class ClientUtility {
    
    static async randomMsgHandler(message: Discord.Message) {

        const content = message.content.toLowerCase();

        if (this.isSpecialized()) {
            if (content.includes('hiro')) {
                const background = BACKGROUNDS[getRandomInt(0, BACKGROUNDS.length)];
                const response = await Axios.post('https://yuuto.dunctebot.com/dialog',
                    {
                        background: background,
                        character: `taiga`,
                        text: `Hiro will be terribly wrong if he thinks he can steal Keitaro from me!`
                    }, {
                    responseType: 'arraybuffer',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                const attachment = new Discord.MessageAttachment(Buffer.from(response.data), 'result.png');
                message.channel.send(attachment);
            }
            else if (content.includes('aiden')) {

                const attachment = Image.getImage('hamburger');

                message.channel.send(`Three orders of double-quarter-pounder cheeseburgers! Two large fries and one large soda!\n` +
                    `Burger patties well-done, three slices of pickles for each! No mayonnaise! Just ketchup and mustard!`)
                    .then(msg => {
                        if (attachment)
                            message.channel.send(attachment);
                    });
            }
            else {
                for (const target of randomMessages) {
                    if (message.content.includes(target.keyword)) {
                        message.channel.send(target.messages[getRandomInt(0, target.messages.length)]);
                        break;
                    }
                }
            }
        }
        else {
            const response = RANDOM_RESPONSES[getRandomInt(0, RANDOM_RESPONSES.length)];
            message.channel.send(response);
        }
    }

    private static isSpecialized() {
        return getRandomInt(0, 100) < SPECIALIZED_CHANCE;
    }
}