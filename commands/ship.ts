// Copyright(C) 2020 Tetsuki Syu
// See bot.ts for the full notice.

import Axios from 'axios';
import * as Discord from 'discord.js';
import * as fs from 'fs';
import * as messages from '../storage/shipMessages.json';
import { escapeUsername, findMembers } from '../utility/helper';
import Command from './base/command';

const filePath = './storage/riggedShips.json';

interface ShipData {
    score: number,
    scoreMessage: string
}

export default class Ship extends Command {
    #riggedPairs: Array<Array<string>>;

    constructor() {
        super('ship', 'fun', 'Ship two users',
            `Run \`ship <user1> <user2>\` to find out the compatibility between the two users!`);

        if (fs.existsSync(filePath)) {
            const rawData = fs.readFileSync(filePath, 'utf8');
            this.#riggedPairs = JSON.parse(rawData);
        }
        else {
            this.#riggedPairs = new Array<Array<string>>();
        }
    }

    async run(client: Discord.Client, message: Discord.Message, args: string[]) {
        const { channel, guild } = message;

        if (args.length < 2) {
            channel.send('This command requires two arguments: `ship <user1> <user2>`.');
            return;
        }

        const [target1] = findMembers(args[0], guild);

        if (!target1) {
            channel.send(`No user found for input ${args[0]}`);
            return;
        }

        const seconds = findMembers(args[1], guild);
        const target2 = this.findNextUserIfSame(target1, seconds);

        if (!target2) {
            channel.send(`No user found for input ${args[1]}`);
            return;
        }

        let data: ShipData;

        if (target1.id === target2.id) {
            data = { score: 100, scoreMessage: `You're a perfect match... for yourself!` };
        }
        else {
            data = this.calcScore(target1, target2);
        }

        const { score, scoreMessage } = data;
        const img1 = this.getAvatarUrl(target1);
        const img2 = this.getAvatarUrl(target2);
        const { data: image } = await Axios
            .get(`https://api.alexflipnote.dev/ship?user=${img1}&user2=${img2}`, {
                responseType: 'arraybuffer'
            });

        const name1 = escapeUsername(target1);
        const name2 = escapeUsername(target2);

        const attachment = new Discord.MessageAttachment(Buffer.from(image), 'love.png');
        const embed = new Discord.MessageEmbed()
            .setTitle(`${name1} and ${name2}`)
            .addField(`Your love score is ${score}%`,
                scoreMessage.replace('{name}', name1).replace('{name2}', name2),
                false)
            .setImage('attachment://love.png');

        channel.send(embed).then(msg => {
            channel.send(attachment);
        });
    }

    private getAvatarUrl(entity: Discord.GuildMember) {
        return entity.user.displayAvatarURL({
            format: 'png',
            size: 128
        });
    }

    private findNextUserIfSame(firstUser: Discord.GuildMember, listOfSeconds: Discord.GuildMember[]) {
        if (!listOfSeconds.length) return null;

        if (listOfSeconds.length === 1) return listOfSeconds[0];

        for (const user of listOfSeconds) {
            if (user.id === firstUser.id) continue;
            return user;
        }

        return null;
    }

    private shouldBeRigged(target1: Discord.GuildMember, target2: Discord.GuildMember): boolean {
        const id1 = target1.id;
        const id2 = target2.id;

        return this.#riggedPairs.some(ids => (ids[0] === id1 && ids[1] === id2) ||
            (ids[0] === id2 && ids[1] === id1));
    }

    private findMessage(score: number): string {
        return messages.find(obj => score <= obj.max_score)!.message;
    }

    private calcScore(user1: Discord.GuildMember, user2: Discord.GuildMember): ShipData {
        let score: number;

        if (this.shouldBeRigged(user1, user2)) {
            score = 100;
        }
        else {
            score = ((parseInt(user1.id, 10) + parseInt(user2.id, 10)) / 7) % 100;
        }

        return { score: score, scoreMessage: this.findMessage(score) };
    }
}