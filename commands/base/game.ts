import * as Discord from 'discord.js';

export default abstract class Game {

    readonly Name: string;
    readonly Description: string;

    constructor(name: string, description: string) {
        this.Name = name;
        this.Description = description;
    }

    abstract async run(client: Discord.Client, message: Discord.Message);
    protected abstract async initialize(user: Discord.User);
    protected abstract async uninitialize(client: Discord.Client, user: Discord.User);
}