import * as Discord from 'discord.js';

export default interface IMemberConfig {
    user: Discord.User;
    userId: string;
    lang: string;
}