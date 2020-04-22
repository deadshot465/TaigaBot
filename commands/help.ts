// Copyright(C) 2020 Tetsuki Syu
// See bot.ts for the full notice.

import * as Discord from 'discord.js';
import { ALIASES, COMMANDS } from '../bot';
import Command from './base/command';

export default class Help extends Command {
    constructor() {
        super('help', 'info', 'Get the usage of any other command',
            `Run \`help <command>\` to get usage instructions on \`<command>\`, if it exists. Run \`help list\` to list possible commands.`);
    }

    run(client: Discord.Client, message: Discord.Message, args: string[]) {
        const commandName = args[0] || 'help';

        const commandLists = COMMANDS.map(cmd => {
            return ` - **${cmd.Category}:** \`${cmd.Name}\`: *${cmd.Description}*`;
        }).join('\n');

        if (commandName === 'list') {
            message.channel.send(
                `Here is a list of all commands and their descriptions:\n${commandLists}`);
            return;
        }

        let command = COMMANDS.get(commandName);

        if (!command && ALIASES.has(commandName)) {
            command = COMMANDS.get(ALIASES.get(commandName)!);
        }

        if (!command) {
            message.reply('There is no such command in my journal.');
            return;
        }

        message.channel.send(
            `**Category:** \`${command!.Category}\`\n**Usage For Command:** \`${command!.Name}\`\n${command!.Usage}${command!.Alias && command!.Alias!.length ? `\n**Aliases:** \`${command!.Alias!}\`` : ''}`);
    }
}