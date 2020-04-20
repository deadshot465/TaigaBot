import * as Discord from 'discord.js';
import * as oracles from '../database/oracles.json';
import { getRandomInt } from '../helper';
import Command from './base/command';

const thumbnailUrl = `https://cdn.discordapp.com/emojis/701918026164994049.png?v=1`;

export default class Oracle extends Command {
    constructor() {
        super('oracle', 'info', 'Draw an oracle and know know future of something on your mind',
            `Run \`oracle\` to draw an oracle and know your fortune.`, ['fortune'], 5);

        console.log(`Total oracles available: ${oracles.length}`);
    }

    run(client: Discord.Client, message: Discord.Message, args: string[]): void {
        const embedMessage = this.getEmbeddedMessage();

        embedMessage.setAuthor(message.member!.displayName,
            message.author.displayAvatarURL({ format: 'png' }));

        message.channel.send(embedMessage);
    }

    private getEmbeddedMessage() {

        const oracle = this.getOracle();

        return new Discord.MessageEmbed()
            .setThumbnail(thumbnailUrl)
            .setColor('#ff0000')
            .setTitle(`${oracle.fortune}`)
            .setDescription(`${oracle.content}`)
            .addField('No', `${oracle.no}`, false)
            .addField('Meaning', `${oracle.meaning}`, false)
            .setFooter('Wish you good luck!');
    }

    private getOracle() {
        return oracles[getRandomInt(0, oracles.length)];
    }
}