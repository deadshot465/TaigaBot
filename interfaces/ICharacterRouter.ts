// Copyright(C) 2020 Tetsuki Syu
// See bot.ts for the full notice.

import * as Discord from 'discord.js';

export default interface ICharacterRouter {
    getFirstName(name: string): string;
    getEmbeddedMessage(): {
        content: Discord.MessageEmbed,
        prefix: string
    };
    getEmoteUrl(emoteId: string): string;
}