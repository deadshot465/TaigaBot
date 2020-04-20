import * as Discord from 'discord.js';
import * as routes from '../database/routes.json';
import { getRandomInt } from '../helper';
import ICharacterRouter from '../interfaces/ICharacterRouter';
import Command from './base/command';

export default class Route extends Command implements ICharacterRouter {

    #endings = ["Perfect", "Good", "Bad", "Worst"];

    constructor() {
        super('route', 'info', 'Tells you what route to play next',
            `Run \`route\` to get which route you want to play next.`, undefined, 5);
    }

    run(client: Discord.Client, message: Discord.Message, args: string[]): void {

        const embedMessage = this.getEmbeddedMessage();

        embedMessage.content.setAuthor(message.member!.displayName,
            message.author.displayAvatarURL({ format: 'png' }));

        message.channel.send(embedMessage.content);
    }

    getFirstName(name: string) {
        return name.split(/\s+/)[0];
    }

    getEmbeddedMessage() {

        const character = this.getRoute();

        const content = new Discord.MessageEmbed()
            .setThumbnail(this.getEmoteUrl(character.emoteId))
            .setColor(character.color)
            .setTitle(`Next: ${character.name}, ${this.getEnding()} Ending`)
            .setDescription(character.description)
            .addField('Age', character.age, true)
            .addField('Birthday', character.birthday, true)
            .addField('Animal Motif', character.animal, true)
            .setFooter(`Play ${this.getFirstName(character.name)}'s route next. All bois are best bois.`);

        return { content: content, prefix: '' };
    }

    getEmoteUrl(emoteId: string) {
        return `https://cdn.discordapp.com/emojis/${emoteId}.gif?v=1`;
    }

    private getEnding() {
        return this.#endings[getRandomInt(0, this.#endings.length)];
    }

    private getRoute() {
        return routes[getRandomInt(0, routes.length)];
    }
}