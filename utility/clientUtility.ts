// Copyright(C) 2020 Tetsuki Syu
// See bot.ts for the full notice.

import Axios from 'axios';
import * as Discord from 'discord.js';
import Image from '../commands/image';
import * as randomMessages from '../storage/randomMessages.json';
import { RANDOM_RESPONSES } from '../storage/reactions';
import { getRandomInt } from './helper';

const SPECIALIZED_CHANCE = 50;
const REACTION_CHANCE = 33;
const USER_REACTION_CHANCE = 25;
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
                    if (message.content.includes(target.keyword) &&
                        target.messages.length > 0) {
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

    static randomReactionHandler(message: Discord.Message) {
        const hitMiss = getRandomInt(0, 100) < REACTION_CHANCE;
        if (hitMiss) {
            for (const target of randomMessages) {
                if (message.content.toLowerCase().includes(target.keyword)) {
                    const reaction = target.reactions[getRandomInt(0, target.reactions.length)];
                    if (/\d+/g.test(reaction)) {
                        message.react(message.guild!.emojis.cache.get(reaction)!)
                            .catch(console.error);
                    }
                    else {
                        message.react(reaction).catch(console.error);
                    }
                    break;
                }
            }
        }
    }

    static randomUserReactionHandler(message: Discord.Message) {
        const hitMiss = getRandomInt(0, 100) < USER_REACTION_CHANCE;
        if (hitMiss) {
            if (message.author.id === '180740743852326912')
                message.reply(`Stop fooling around, Rhakon. Where's my next chapter?! <:TaigaAngry:699705315519889479>`);
            else if (message.author.id === '215526684797960192')
                message.reply(`Restrain Rhakon, will you, Kachi?`);
            else if (message.author.id === '169936831373115393')
                message.reply(`You're the best!!! <:TaigaHappy:586763559434977293>`);
        }
    }

    private static isSpecialized() {
        return getRandomInt(0, 100) < SPECIALIZED_CHANCE;
    }
}