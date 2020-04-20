import * as Discord from 'discord.js';

export default interface ICommand {
    run(client: Discord.Client, message: Discord.Message, args: string[]): void;
}