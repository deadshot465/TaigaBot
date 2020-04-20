import * as Discord from 'discord.js';

export default interface ICharacterRouter {
    getFirstName(name: string): string;
    getEmbeddedMessage(): {
        content: Discord.MessageEmbed,
        prefix: string
    };
    getEmoteUrl(emoteId: string): string;
}