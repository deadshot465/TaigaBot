// Copyright(C) 2020 Tetsuki Syu
// See bot.ts for the full notice.

import * as Discord from 'discord.js';
import { MEMBER_CONFIG } from '../bot';
import IMemberConfig from '../interfaces/IMemberConfig';
import * as localizedStrings from '../storage/localizedStrings.json';
import { EMOTE_ID_REGEX, EMOTE_IS_ANIMATED_REGEX } from '../utility/patterns';
import Command from './base/command';

const enStrings = localizedStrings.find(val => val.lang === 'en')!;
const jpStrings = localizedStrings.find(val => val.lang === 'jp')!;

export default class Enlarge extends Command {
    constructor() {
        super('enlarge', 'util', enStrings.texts.enlarge.description,
            enStrings.texts.enlarge.usage);
    }

    async run(client: Discord.Client, message: Discord.Message, args: string[]) {

        const config: IMemberConfig = MEMBER_CONFIG.find(config => config.userId === message.author.id)!;
        const enlargeStrings = (config.lang === 'en') ? enStrings.texts.enlarge : jpStrings.texts.enlarge;

        if (!EMOTE_ID_REGEX.test(args[0])) {
            message.channel.send(
                enlargeStrings.errors.no_emote
            );
            return;
        }

        const [emoteId] = EMOTE_ID_REGEX.exec(args[0])!;
        const emoteFormat = EMOTE_IS_ANIMATED_REGEX.test(args[0]) ? '.gif' : '.png';
        const emoteLink = `https://cdn.discordapp.com/emojis/${emoteId}${emoteFormat}`;

        message.channel.send(emoteLink);
    }
}