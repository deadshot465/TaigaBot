import * as Discord from 'discord.js';
import { MEMBER_CONFIG } from '../bot';
import { findMembers } from './helper';

export default class AdminUtility {
    static execute(client: Discord.Client, message: Discord.Message, args: string[]) {

        const { channel, guild } = message;
        const cmd = args.shift()?.toLowerCase()!;
        const deleteOps = { timeout: 5 * 1000 };

        switch (cmd) {
            case 'setlang':
                {
                    console.log('Setting language code...');
                    const [user] = findMembers(args[0], guild);
                    for (let i = 0; i < MEMBER_CONFIG.length; i++) {
                        if (MEMBER_CONFIG[i].userId === user.id) {
                            MEMBER_CONFIG[i].lang = args[1];
                            channel.send(`Successfully set the language for ${user.displayName} to ${args[1]}`)
                                .then(m => {
                                    m.delete(deleteOps).then(_m => message.delete());
                                });
                            return;
                        }
                    }
                    MEMBER_CONFIG.push({ user: user.user, userId: user.id, lang: args[1] });
                    channel.send(`Successfully add the language for ${user.displayName}: ${args[1]}`)
                        .then(m => {
                            m.delete(deleteOps).then(_m => message.delete());
                        });
                    return;
                }
            default:
                channel.send(`Invalid admin command.`);
                return;
        }
    }
}