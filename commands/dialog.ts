// Copyright(C) 2020 Tetsuki Syu
// See bot.ts for the full notice.

import axios, { AxiosError } from 'axios';
import * as Discord from 'discord.js';
import * as localizedStrings from '../storage/localizedStrings.json';
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

const enStrings = localizedStrings.find(val => val.lang === 'en')!;

export default class Dialog extends Command {
    constructor() {

        const usage = enStrings.texts.dialog.usage
            .replace('{backgrounds}', backgroundString)
            .replace('{characters}', charactersString);

        super('dialog', 'fun',
            enStrings.texts.dialog.description, usage);
    }

    async run(client: Discord.Client, message: Discord.Message, args: string[]) {
        const { channel } = message;

        const now = Date.now();

        const dialogStrings = enStrings.texts.dialog;
        const errorMsg = dialogStrings.errors;

        if (args.length < 2) {
            channel.send(errorMsg.length_too_short);
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
            const backgroundNotFound = errorMsg.background_not_found
                .replace('{background}', background)
                .replace('{backgrounds}', backgroundString);
            channel.send(backgroundNotFound);
            return;
        }

        if (!characters.includes(character)) {
            const characterNotFound = errorMsg.character_not_found
                .replace('{character}', character)
                .replace('{characters}', charactersString);
            channel.send(characterNotFound);
            return;
        }

        if (args.length <= 0) {
            channel.send(errorMsg.no_message);
            return;
        }

        // Gets the message by getting the rest of the args
        const text = args.join(' ');

        // Check if message is more than 120 chars
        if (text.length > 120) {
            channel.send(errorMsg.message_too_long);
            return;
        }

        // Tests if message includes emoji or emotes
        if (EMOJI_REGEX.test(text) ||
            EMOTE_MENTIONS_REGEX.test(text) ||
            NONASCII_REGEX.test(text)) {
            channel.send(errorMsg.wrong_character_set);
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

            message.reply(dialogStrings.result, attachment);
        } catch (e) {
            if ((<AxiosError>e).response!.status === 429) {
                channel.send(errorMsg.cooldown);
                return;
            }

            const genericError = errorMsg.generic
                .replace('{json}', JSON.parse((<AxiosError>e).response!.data).message);

            channel.send(genericError);
        }
    }
}