import * as Discord from 'discord.js';
import ICommand from "../../interfaces/ICommand";

export default class Command implements ICommand {
    readonly Name: string;
    readonly Category: string;
    readonly Description: string;
    readonly Cooldown: number;
    readonly Alias: string[] | null | undefined;
    readonly Usage: string;

    constructor(name: string, category: string, description: string, usage: string,
        alias?: string[], cooldown?: number) {
        this.Name = name;
        this.Category = category;
        this.Description = description;
        this.Usage = usage;
        this.Cooldown = cooldown || 3;
        this.Alias = alias;
    }

    run(client: Discord.Client, message: Discord.Message, args: string[]): void {
        throw new Error(`Run function not overridden in ${this.constructor.name}`);
    }
}