// Copyright(C) 2020 Tetsuki Syu
// See bot.ts for the full notice.

import * as Discord from 'discord.js';
import { ALIASES, COMMANDS, MEMBER_CONFIG } from '../bot';
import IMemberConfig from '../interfaces/IMemberConfig';
import * as localizedStrings from '../storage/localizedStrings.json';
import Command from './base/command';

const enStrings = localizedStrings.find(val => val.lang === 'en')!;
const jpStrings = localizedStrings.find(val => val.lang === 'jp')!;

export default class Help extends Command {
    constructor() {
        super('help', 'info', enStrings.texts.help.description,
            enStrings.texts.help.usage);
    }

    run(client: Discord.Client, message: Discord.Message, args: string[]) {
        const commandName = args[0] || 'help';
        const config: IMemberConfig = MEMBER_CONFIG.find(config => config.userId === message.author.id)!;
        const helpStrings = (config.lang === 'en') ? enStrings.texts.help : jpStrings.texts.help;

        const commandLists = COMMANDS.map(cmd => {
            return ` - **${cmd.Category}:** \`${cmd.Name}\`: *${cmd.Description}*`;
        }).join('\n');

        if (commandName === 'list') {
            message.channel.send(
                helpStrings.errors.show_list.replace('{commandLists}', commandLists));
            return;
        }

        let command = COMMANDS.get(commandName);

        if (!command && ALIASES.has(commandName)) {
            command = COMMANDS.get(ALIASES.get(commandName)!);
        }

        if (!command) {
            message.reply(helpStrings.errors.no_command);
            return;
        }

        const result = helpStrings.result
            .replace('{category}', command!.Category)
            .replace('{name}', command!.Name)
            .replace('{usage}', command!.Usage)
            .replace('{aliases}', (command!.Alias && command!.Alias.length) ? `\n**Aliases:** \`${command!.Alias!}\`` : ``);

        message.channel.send(result);
    }
}