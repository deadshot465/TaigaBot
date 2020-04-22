// Copyright(C) 2020 Tetsuki Syu
// See bot.ts for the full notice.

import * as Discord from 'discord.js';
import ICharacterRouter from '../interfaces/ICharacterRouter';
import * as valentines from '../storage/valentines.json';
import { getRandomInt } from "../utility/helper";
import Command from './base/command';

export default class Valentine extends Command implements ICharacterRouter {
    constructor() {
        super('valentine', 'info', 'Tells you your next valentine',
            `Run \`valentine\` to get your next valentine.`, ['lover'], 5);
    }

    run(client: Discord.Client, message: Discord.Message, args: string[]): void {
        const embedMessage = this.getEmbeddedMessage();

        embedMessage.content.setAuthor(message.member!.displayName,
            message.author.displayAvatarURL({ format: 'png' }));

        if (embedMessage.prefix.length > 0) {
            message.channel
                .send(`**Bah, we're already dating and I'm the best. No chance for you, loser.**`)
                .then(msg => {
                    message.channel.send(embedMessage.content);
                });
        }
        else {
            message.channel.send(embedMessage.content);
        }
    }

    getFirstName(name: string): string {
        return name.split(/\s+/)[0];
    }

    getEmbeddedMessage() {
        const valentine = this.getValentine();
        const isKeitaro = this.getFirstName(valentine.name) === 'Keitaro';
        const prefixSuffix = isKeitaro ? '~~' : '';
        const footer = isKeitaro ? `See? Told you Keitaro is my boyfriend. Later loser.` :
            `Don't fret if ${this.getFirstName(valentine.name)} isn't your type. Who knows, maybe it's time for a new favorite.`;

        const content = new Discord.MessageEmbed()
            .setThumbnail(this.getEmoteUrl(valentine.emoteId))
            .setColor(valentine.color)
            .setTitle(`${prefixSuffix}Your valentine is ${valentine.name}${prefixSuffix}`)
            .setDescription(`${prefixSuffix}${valentine.description}${prefixSuffix}`)
            .addField('Age', `${prefixSuffix}${valentine.age}${prefixSuffix}`, true)
            .addField('Birthday', `${prefixSuffix}${valentine.birthday}${prefixSuffix}`, true)
            .addField('Animal Motif', `${prefixSuffix}${valentine.animal}${prefixSuffix}`, true)
            .setFooter(footer);

        return { content: content, prefix: prefixSuffix };
    }

    getEmoteUrl(emoteId: string): string {
        return `https://cdn.discordapp.com/emojis/${emoteId}.png?v=1`;
    }

    private getValentine() {
        return valentines[getRandomInt(0, valentines.length)];
    }
}