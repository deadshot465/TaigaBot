// Copyright(C) 2020 Tetsuki Syu
// See bot.ts for the full notice.

import * as Discord from 'discord.js';
import { MEMBER_CONFIG } from '../bot';
import IMemberConfig from '../interfaces/IMemberConfig';
import * as localizedStrings from '../storage/localizedStrings.json';
import * as oracles from '../storage/oracles.json';
import { getRandomInt } from '../utility/helper';
import Command from './base/command';

const thumbnailUrl = `https://cdn.discordapp.com/emojis/701918026164994049.png?v=1`;
const enStrings = localizedStrings.find(val => val.lang === 'en')!;
const jpStrings = localizedStrings.find(val => val.lang === 'jp')!;

export default class Oracle extends Command {
    constructor() {
        super('oracle', 'info', enStrings.texts.oracle.description,
            enStrings.texts.oracle.usage, ['fortune'], 5);

        console.log(`Total oracles available: ${oracles.length}`);
    }

    run(client: Discord.Client, message: Discord.Message, args: string[]): void {
        const embedMessage = this.getEmbeddedMessage(message);

        embedMessage.setAuthor(message.member!.displayName,
            message.author.displayAvatarURL({ format: 'png' }));

        message.channel.send(embedMessage);
    }

    private getEmbeddedMessage(message: Discord.Message) {
        const oracle = this.getOracle();
        const config: IMemberConfig = MEMBER_CONFIG.find(config => config.userId === message.author.id)!;
        const oracleStrings = (config.lang === 'en') ? enStrings.texts.oracle : jpStrings.texts.oracle;

        return new Discord.MessageEmbed()
            .setThumbnail(thumbnailUrl)
            .setColor('#ff0000')
            .setTitle(`${oracle.fortune}`)
            .setDescription(`${oracle.content}`)
            .addField(oracleStrings.uis.no, `${oracle.no}`, false)
            .addField(oracleStrings.uis.meaning, `${oracle.meaning}`, false)
            .setFooter(oracleStrings.result);
    }

    private getOracle() {
        return oracles[getRandomInt(0, oracles.length)];
    }
}