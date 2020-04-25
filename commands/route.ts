// Copyright(C) 2020 Tetsuki Syu
// See bot.ts for the full notice.

import * as Discord from 'discord.js';
import { MEMBER_CONFIG } from '../bot';
import ICharacterRouter from '../interfaces/ICharacterRouter';
import IMemberConfig from '../interfaces/IMemberConfig';
import * as localizedStrings from '../storage/localizedStrings.json';
import * as routes from '../storage/routes.json';
import { getRandomInt } from '../utility/helper';
import Command from './base/command';

const enStrings = localizedStrings.find(val => val.lang === 'en')!;
const jpStrings = localizedStrings.find(val => val.lang === 'jp')!;

export default class Route extends Command implements ICharacterRouter {

    constructor() {
        super('route', 'info', enStrings.texts.route.description,
            enStrings.texts.route.usage, undefined, 5);
    }

    run(client: Discord.Client, message: Discord.Message, args: string[]): void {

        const embedMessage = this.getEmbeddedMessage(message);

        embedMessage.content.setAuthor(message.member!.displayName,
            message.author.displayAvatarURL({ format: 'png' }));

        message.channel.send(embedMessage.content);
    }

    getFirstName(name: string) {
        return name.split(/\s+/)[0];
    }

    getEmbeddedMessage(message: Discord.Message) {
        const config: IMemberConfig = MEMBER_CONFIG.find(config => config.userId === message.author.id)!;
        const routeStrings = (config.lang === 'en') ? enStrings.texts.route : jpStrings.texts.route;
        const character = this.getRoute();

        const title = routeStrings.infos.next
            .replace('{name}', character.name)
            .replace('{ending}', this.getEnding(message));

        const footer = routeStrings.infos.footer
            .replace('{firstName}', this.getFirstName(character.name));

        const content = new Discord.MessageEmbed()
            .setThumbnail(this.getEmoteUrl(character.emoteId))
            .setColor(character.color)
            .setTitle(title)
            .setDescription(character.description)
            .addField(routeStrings.infos.age, character.age, true)
            .addField(routeStrings.infos.birthday, character.birthday, true)
            .addField(routeStrings.infos.animal_motif, character.animal, true)
            .setFooter(footer);

        return { content: content, prefix: '' };
    }

    getEmoteUrl(emoteId: string) {
        return `https://cdn.discordapp.com/emojis/${emoteId}.gif?v=1`;
    }

    private getEnding(message: Discord.Message) {
        const config: IMemberConfig = MEMBER_CONFIG.find(config => config.userId === message.author.id)!;
        const routeStrings = (config.lang === 'en') ? enStrings.texts.route : jpStrings.texts.route;
        return routeStrings
            .infos.endings[getRandomInt(0, routeStrings.infos.endings.length)];
    }

    private getRoute() {
        return routes[getRandomInt(0, routes.length)];
    }
}