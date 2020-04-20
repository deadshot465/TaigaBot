import * as Discord from 'discord.js'
import Command from './base/command';

const EMOTE_ID_REGEX = /[^:]+(?=>)/;
const EMOTE_IS_ANIMATED_REGEX = /(<a)/;

export default class Enlarge extends Command {
    constructor() {
        super('enlarge', 'util', 'Returns an enlarged emote',
            `Run \`enlarge <emote>\` to get the full link to \`<emote>\` at a large size.`);
    }

    async run(client: Discord.Client, message: Discord.Message, args: string[]) {
        if (!EMOTE_ID_REGEX.test(args[0])) {
            message.channel.send(
                `What do you think I could do if you don't even give me an emote?`
            );
            return;
        }

        const [emoteId] = EMOTE_ID_REGEX.exec(args[0])!;
        const emoteFormat = EMOTE_IS_ANIMATED_REGEX.test(args[0]) ? '.gif' : '.png';
        const emoteLink = `https://cdn.discordapp.com/emojis/${emoteId}${emoteFormat}`;

        message.channel.send(emoteLink);
    }
}