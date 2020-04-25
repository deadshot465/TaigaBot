// Copyright(C) 2020 Tetsuki Syu
// See bot.ts for the full notice.

import Axios from 'axios';
import * as Discord from 'discord.js';
import { MEMBER_CONFIG } from '../bot';
import Image from '../commands/image';
import IMemberConfig from '../interfaces/IMemberConfig';
import * as localizedStrings from '../storage/localizedStrings.json';
import * as randomMessages from '../storage/randomMessages.json';
import { getRandomInt } from './helper';
import { EMOTE_MENTIONS_REGEX } from './patterns';

const SPECIALIZED_CHANCE = 50;
const REACTION_CHANCE = 33;
const USER_REACTION_CHANCE = 5;
const MENTION_REACTION_CHANCE = 25;
const EDIT_CHANCE = 10;
const BACKGROUNDS = [
    "bath", "beach", "cabin", "camp",
    "cave", "forest", "messhall"
];

const KACHI_REACTIONS = [
    //`Restrain Rhakon, will you, Kachi?`,
    //`You know Rhakon won't do his job if you're not around.`,
    `*Looking at Rhakon's draft works* Ugh, what a cringe test.`,
    `Could you make more commissions of my Keitaro and me, instead of that stinky Yoichi?`,
    `I will kick out Yoichi and Yuki if they continue bothering my Keitaro time.`
];

const RHAKON_REACTIONS = [
    `Stop fooling around, Rhakon. Where's my next chapter?! <:TaigaAngry:699705315519889479>`,
    `LMFAO`,
    `Smh.`,
    `Tell Keitaro to move into my apartment asap.`,
    `No objection accepted.`,
    `You should listen to Kachi.`,
    `AND WHERE IS MY FUCKING CLAY`,
    `I swear I will kick Eduard's ass if he doesn't give me my clay.`,
    `And here I thought Lee will be more *understandable* right now.`,
    `Midoriai should be an attribute or a property of mine character.`
];

const MAGIC_REACTIONS = [
    `You're the best!!! <:TaigaHappy:586763559434977293>`
];

const BRANDON_REACTIONS = [
    `Thank you for making a server for me! <:TaigaHappy:586763559434977293> I totally have no idea how this Dicksword works.`,
    `Could you let me top Keitaro sometimes? <:TaigaAnnoyed:702646568146436187>`,
    `Only the best like myself can be my sidekicks in this server.`,
    `I will kick out anyone who threatens Keitaro, like Hiro maybe.`,
    `If Yuri joins, she will be kicked on sight. I don't want her bugging me when I'm having my Keitaro time.`
];

const enStrings = localizedStrings.find(val => val.lang === 'en')!;
const jpStrings = localizedStrings.find(val => val.lang === 'jp')!;

export default class ClientUtility {
    
    static async randomMsgHandler(message: Discord.Message) {

        if (message.author.bot) return;

        const content = message.content.toLowerCase();
        const config: IMemberConfig = MEMBER_CONFIG.find(config => config.userId === message.author.id)!;
        const responseStrings = (config.lang === 'en') ? enStrings : jpStrings;

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

                const attachment = Image.getImage('hamburger', message);

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
                        (target.messages.en.length > 0 || target.messages.jp.length > 0)) {
                        const targetMessage = (config.lang === 'en') ? target.messages.en : target.messages.jp;
                        message.channel.send(targetMessage[getRandomInt(0, targetMessage.length)]);
                        break;
                    }
                }
            }
        }
        else {
            const response = responseStrings.texts
                .random_responses[getRandomInt(0, responseStrings.texts.random_responses.length)];
            message.channel.send(response);
        }
    }

    static randomReactionHandler(message: Discord.Message) {
        if (message.author.bot) return;
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
                message.reply(RHAKON_REACTIONS[getRandomInt(0, RHAKON_REACTIONS.length)]);
            else if (message.author.id === '215526684797960192')
                message.reply(KACHI_REACTIONS[getRandomInt(0, KACHI_REACTIONS.length)]);
            else if (message.author.id === '169936831373115393')
                message.reply(MAGIC_REACTIONS[getRandomInt(0, MAGIC_REACTIONS.length)]);
            else if (message.author.id === '263348633280315395')
                message.reply(BRANDON_REACTIONS[getRandomInt(0, BRANDON_REACTIONS.length)]);
        }
    }

    static mentionHandler(message: Discord.Message) {
        const hitMiss = getRandomInt(0, 100) < MENTION_REACTION_CHANCE;
        if (hitMiss) {
            if (message.mentions.users.get('697727604366639136')) {
                const msgs = randomMessages.find(val => val.keyword === 'taiga');
                const config: IMemberConfig = MEMBER_CONFIG.find(config => config.userId === message.author.id)!;
                if (msgs) {
                    const responses = (config.lang === 'en') ? msgs.messages.en : msgs.messages.jp;
                    message.reply(responses[getRandomInt(0, responses.length)]);
                }
            }
        }
    }

    static randomEditHandler(message: Discord.Message) {
        if (message.author.bot) return;
        const hitMiss = getRandomInt(0, 100) < EDIT_CHANCE;
        if (hitMiss) {
            if (message.content.toLowerCase().includes('taiga')) {
                if (EMOTE_MENTIONS_REGEX.test(message.content.toLowerCase())) return;
                let newStr = message.content.replace('taiga', 'the Great Taiga Akatora');
                newStr = newStr.replace('Taiga', 'The Great Taiga Akatora');
                message.edit(newStr);
            }
        }
    }

    private static isSpecialized() {
        return getRandomInt(0, 100) < SPECIALIZED_CHANCE;
    }
}