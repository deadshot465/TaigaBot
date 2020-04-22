// Copyright(C) 2020 Tetsuki Syu
// See bot.ts for the full notice.

import axios, { AxiosError } from 'axios';
import * as Discord from 'discord.js';
import { EMOJI_REGEX, EMOTE_MENTIONS_REGEX, NONASCII_REGEX } from '../utility/patterns';
import Command from './base/command';

const backgrounds = [
    "bath", "beach", "cabin", "camp",
    "cave", "forest", "messhall"
];

const characters = [
    "aiden", "avan", "chiaki", "connor", "eduard", "felix", "goro", "hiro",
    "hunter", "jirou", "keitaro", "kieran", "knox", "lee", "naoto", "natsumi",
    "seto", "taiga", "yoichi", "yoshi", "yuri", "yuuto"
];

const backgroundString = backgrounds.join("`, `");
const charactersString = characters.join("`, `");

export default class Dialog extends Command {
    constructor() {
        super('dialog', 'fun',
            'Returns an image of a character in Camp Buddy saying anything you want',
            `Run \`dialog <background> <character> <message>\` or \`dialog <character> <message>\` to give you an image of a Camp Buddy character with a custom dialog!\nAvailable backgrounds : \`${backgroundString}\`\nAvailable characters : \`${charactersString}\``
        );
    }

    async run(client: Discord.Client, message: Discord.Message, args: string[]) {
        const { channel } = message;

        const now = Date.now();

        if (args.length < 2) {
            channel.send('This command requires two arguments : `dialog [background] <character> <text>` ([] is optional)');
            return;
        }
        
        let character = args.shift()!.toLowerCase();
        let background: string;

        if (characters.includes(character)) {
            background = 'camp';
        }
        else {
            background = character;
            character = args.shift()!.toLowerCase();
        }

        if (!backgrounds.includes(background)) {
            channel.send(`Sorry, but I couldn't find \`${background}\` as a location\nAvailable backgrounds are : \`${backgroundString}\``);
            return;
        }

        if (!characters.includes(character)) {
            channel.send(`Sorry, but I don't think that \`${character}\` is a character in Camp Buddy\nAvailable characters are : \`${charactersString}\``);
            return;
        }

        if (args.length <= 0) {
            channel.send('At least give me something to send, you dumbass.');
            return;
        }

        // Gets the message by getting the rest of the args
        const text = args.join(' ');

        // Check if message is more than 120 chars
        if (text.length > 120) {
            channel.send('Sorry, the message limit is 120 characters <:TaigaAck2:700006264507465778>');
            return;
        }

        // Tests if message includes emoji or emotes
        if (EMOJI_REGEX.test(text) ||
            EMOTE_MENTIONS_REGEX.test(text) ||
            NONASCII_REGEX.test(text)) {
            channel.send(`I don't do emotes, mentions, or non-latin characters`);
            return;
        }

        try {
            const response = await axios.post('https://yuuto.dunctebot.com/dialog',
                { background, character, text }, {
                responseType: 'arraybuffer',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            const attachment = new Discord.MessageAttachment(Buffer.from(response.data),
                'result.png');

            console.debug(`Generated image for ${character} at ${background}, took ${Date.now() - now}ms`);

            message.reply('Here you go~!', attachment);
        } catch (e) {
            if ((<AxiosError>e).response!.status === 429) {
                channel.send(`I only have two hands, not an octopus. Bother me again later. <:TaigaAngry:699705315519889479>`);
                return;
            }

            channel.send(`An error just happened. I blame Rhakon. <:TaigaLOL:700004692079542333> - ${JSON.parse((<AxiosError>e).response!.data).message}`);
        }
    }
}