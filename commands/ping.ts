// Copyright(C) 2020 Tetsuki Syu
// See bot.ts for the full notice.

import * as Discord from 'discord.js';
import Command from './base/command';

export default class Ping extends Command {
    constructor() {
        super('ping', 'info', 'Returns latency and API ping',
            `Run \`ping\` to get the current latency and API ping.`);
    }

    async run(client: Discord.Client, message: Discord.Message, args: string[]) {
        const now = Date.now();
        const msg = await message.channel.send(`\uD83C\uDFD3 Pinging....`);
        msg.edit(
            `\uD83C\uDFD3 Pong!\nLatency is ${Date.now() -
            now}ms. API Latency is ${Math.round(client.ws.ping)}ms`
        );
    }
}