// Copyright(C) 2020 Tetsuki Syu
// See bot.ts for the full notice.

import * as Discord from 'discord.js';
import { MEMBER_CONFIG } from '../bot';
import ICharacterRouter from '../interfaces/ICharacterRouter';
import IMemberConfig from '../interfaces/IMemberConfig';
import * as localizedStrings from '../storage/localizedStrings.json';
import * as valentines from '../storage/valentines.json';
import { getRandomInt } from "../utility/helper";
import Command from './base/command';

const enStrings = localizedStrings.find(val => val.lang === 'en')!;
const jpStrings = localizedStrings.find(val => val.lang === 'jp')!;

export default class Valentine extends Command implements ICharacterRouter {
    constructor() {
        super('valentine', 'info', enStrings.texts.valentine.description,
            enStrings.texts.valentine.usage, ['lover'], 5);
    }

    run(client: Discord.Client, message: Discord.Message, args: string[]): void {
        const embedMessage = this.getEmbeddedMessage(message);
        const config: IMemberConfig = MEMBER_CONFIG.find(config => config.userId === message.author.id)!;
        const valentineStrings = (config.lang === 'en') ? enStrings.texts.valentine : jpStrings.texts.valentine;

        embedMessage.content.setAuthor(message.member!.displayName,
            message.author.displayAvatarURL({ format: 'png' }));

        if (embedMessage.prefix.length > 0) {
            message.channel
                .send(valentineStrings.infos.keitaro_header)
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

    getEmbeddedMessage(message: Discord.Message) {
        const valentine = this.getValentine();
        const isKeitaro = this.getFirstName(valentine.name) === 'Keitaro';
        const prefixSuffix = isKeitaro ? '~~' : '';
        const config: IMemberConfig = MEMBER_CONFIG.find(config => config.userId === message.author.id)!;
        const valentineStrings = (config.lang === 'en') ? enStrings.texts.valentine : jpStrings.texts.valentine;
        const footer = isKeitaro ? valentineStrings.infos.keitaro_footer :
            valentineStrings.infos.normal_footer.replace('{firstName}', this.getFirstName(valentine.name));

        const valentineName = valentineStrings.infos.valentine
            .replace('{name}', valentine.name)
            .replace('{prefixSuffix}', prefixSuffix)
            .replace('{prefixSuffix}', prefixSuffix);

        const content = new Discord.MessageEmbed()
            .setThumbnail(this.getEmoteUrl(valentine.emoteId))
            .setColor(valentine.color)
            .setTitle(valentineName)
            .setDescription(`${prefixSuffix}${valentine.description}${prefixSuffix}`)
            .addField(valentineStrings.infos.age, `${prefixSuffix}${valentine.age}${prefixSuffix}`, true)
            .addField(valentineStrings.infos.birthday, `${prefixSuffix}${valentine.birthday}${prefixSuffix}`, true)
            .addField(valentineStrings.infos.animal_motif, `${prefixSuffix}${valentine.animal}${prefixSuffix}`, true)
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