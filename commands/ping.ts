// Copyright(C) 2020 Tetsuki Syu
// See bot.ts for the full notice.

import * as Discord from 'discord.js';
import { MEMBER_CONFIG } from '../bot';
import IMemberConfig from '../interfaces/IMemberConfig';
import * as localizedStrings from '../storage/localizedStrings.json';
import Command from './base/command';

const enStrings = localizedStrings.find(val => val.lang === 'en')!;
const jpStrings = localizedStrings.find(val => val.lang === 'jp')!;

export default class Ping extends Command {
    constructor() {
        super('ping', 'info', enStrings.texts.ping.description,
            enStrings.texts.ping.usage);
    }

    async run(client: Discord.Client, message: Discord.Message, args: string[]) {
        const config: IMemberConfig = MEMBER_CONFIG.find(config => config.userId === message.author.id)!;
        const pingStrings = (config.lang === 'en') ? enStrings.texts.ping : jpStrings.texts.ping;
        const now = Date.now();
        const msg = await message.channel.send(pingStrings.infos.pinging);
        const pingMsg = pingStrings.infos.responding
            .replace('{latency}', (Date.now() - now).toString())
            .replace('{apiLatency}', Math.round(client.ws.ping).toString());
        msg.edit(pingMsg);
    }
}