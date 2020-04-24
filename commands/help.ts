// Copyright(C) 2020 Tetsuki Syu
// See bot.ts for the full notice.

import * as Discord from 'discord.js';
import { ALIASES, COMMANDS } from '../bot';
import * as localizedStrings from '../storage/localizedStrings.json';
import Command from './base/command';

const enStrings = localizedStrings.find(val => val.lang === 'en')!;

export default class Help extends Command {
    constructor() {
        super('help', 'info', enStrings.texts.help.description,
            enStrings.texts.help.usage);
    }

    run(client: Discord.Client, message: Discord.Message, args: string[]) {
        const commandName = args[0] || 'help';

        const commandLists = COMMANDS.map(cmd => {
            return ` - **${cmd.Category}:** \`${cmd.Name}\`: *${cmd.Description}*`;
        }).join('\n');

        if (commandName === 'list') {
            message.channel.send(
                enStrings.texts.help.errors.show_list.replace('{commandLists}', commandLists));
            return;
        }

        let command = COMMANDS.get(commandName);

        if (!command && ALIASES.has(commandName)) {
            command = COMMANDS.get(ALIASES.get(commandName)!);
        }

        if (!command) {
            message.reply(enStrings.texts.help.errors.no_command);
            return;
        }

        const result = enStrings.texts.help.result
            .replace('{category}', command!.Category)
            .replace('{name}', command!.Name)
            .replace('{usage}', command!.Usage)
            .replace('{aliases}', (command!.Alias && command!.Alias.length) ? `\n**Aliases:** \`${command!.Alias!}\`` : ``);

        message.channel.send(result);
    }
}