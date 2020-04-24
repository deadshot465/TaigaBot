// Copyright(C) 2020 Tetsuki Syu
// See bot.ts for the full notice.

import * as Discord from 'discord.js';
import * as localizedStrings from '../storage/localizedStrings.json';
import { EMOTE_ID_REGEX, EMOTE_IS_ANIMATED_REGEX } from '../utility/patterns';
import Command from './base/command';

const enStrings = localizedStrings.find(val => val.lang === 'en')!;

export default class Enlarge extends Command {
    constructor() {
        super('enlarge', 'util', enStrings.texts.enlarge.description,
            enStrings.texts.enlarge.usage);
    }

    async run(client: Discord.Client, message: Discord.Message, args: string[]) {
        if (!EMOTE_ID_REGEX.test(args[0])) {
            message.channel.send(
                enStrings.texts.enlarge.errors.no_emote
            );
            return;
        }

        const [emoteId] = EMOTE_ID_REGEX.exec(args[0])!;
        const emoteFormat = EMOTE_IS_ANIMATED_REGEX.test(args[0]) ? '.gif' : '.png';
        const emoteLink = `https://cdn.discordapp.com/emojis/${emoteId}${emoteFormat}`;

        message.channel.send(emoteLink);
    }
}