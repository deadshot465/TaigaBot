// Copyright(C) 2020 Tetsuki Syu
// See bot.ts for the full notice.

import * as Discord from 'discord.js';
import ICommand from "../../interfaces/ICommand";

export default abstract class Command implements ICommand {
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

    abstract run(client: Discord.Client, message: Discord.Message, args: string[]);
}