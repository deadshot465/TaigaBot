//    Taiga Bot. A bot that aims to provide interactive experiences to Taiga's fans.
//    Copyright(C) 2020 Tetsuki Syu
//    
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//    
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//    
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see < https://www.gnu.org/licenses/>.
//
//    **This is a modified and rewritten version of Yuuto bot.**
//    **Please refer to Yuuto bot's repository for more information.**
//    **https://github.com/Yuuto-Project/yuuto-bot**
//    **Codebase also influenced by Hiro bot by dunste123.**
//    **https://github.com/dunste123/hirobot**

import * as Discord from 'discord.js';
import * as DotEnv from 'dotenv';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import Command from './commands/base/command';
import IMemberConfig from './interfaces/IMemberConfig';
import * as localizedStrings from './storage/localizedStrings.json';
import AdminUtility from './utility/adminUtility';
import ClientUtility from './utility/clientUtility';
import { getRandomInt } from './utility/helper';

// Configures the environment variables
DotEnv.config();

export const PREFIX = process.env.PREFIX || '!';
export const COMMANDS = new Discord.Collection<string, Command>();
export const ALIASES = new Discord.Collection<string, string>();
export const COOLDOWNS = new Discord.Collection<string, Discord.Collection<string, number>>();
export const MEMBER_CONFIG = new Array<IMemberConfig>();

// Collections and Sets
const taiga = new Discord.Client({
    ws: {
        // Read more https://discord.js.org/#/docs/main/stable/class/Intents?scrollTo=s-FLAGS
        intents: [
            "GUILDS",
            "GUILD_MEMBERS",
            "GUILD_MESSAGES",
            "GUILD_MESSAGE_REACTIONS"
        ]
    },
    // We need to fetch all members to make sure that finderUtil works properly
    fetchAllMembers: true
});

const enStrings = localizedStrings.find(val => val.lang === 'en')!;
const jpStrings = localizedStrings.find(val => val.lang === 'jp')!;
const configPath = './storage/memberConfigs.json';

(async () => {
    // Load command files
    const commandsFiles = readdirSync('./commands/').filter(file => file.endsWith('.js'));

    // Load commands
    for (const file of commandsFiles) {
        const { default: ctor } = await import(`./commands/${file}`);

        if (!ctor) continue;

        // Checks if we actually have a command here, we don't want to register classes that are not commands
        if (!((<Function>ctor).prototype instanceof Command)) {
            console.error(`ERROR: Command ${(<Function>ctor).name} does not extend command base class and is ignored.`);
            continue;
        }

        const command: Command = new ctor();
        COMMANDS.set(command.Name, command);

        if (command.Alias) {
            command.Alias.forEach(_alias => ALIASES.set(_alias, command.Name));
        }
    }

})().catch(console.error);

(async () => {

    console.log(`Reading config files...`);
    if (existsSync(configPath)) {
        const file = readFileSync(configPath, 'utf8');
        const arr = JSON.parse(file) as Array<IMemberConfig>;
        console.log(arr);
        arr.forEach(obj => {
            MEMBER_CONFIG.push(obj);
        });
        console.log(`Config files successfully read.`);
        console.log(`MEMBER_CONFIG: ${MEMBER_CONFIG.length} data available.`);
    }

})().catch(console.error);

// Initialize the bot's startup
taiga.once('ready', () => {
    console.log('Connected');
    console.log(`Logged in as: ${taiga.user?.username} - (${taiga.user?.id})`);
    console.log(`Hello, ${taiga.user?.username} is now online.`);

    const presenceFn = () => {
        console.log('Setting presence');

        const activity = enStrings.texts.presence[getRandomInt(0, enStrings.texts.presence.length)];

        taiga.user?.setPresence({
            status: 'online',
            activity: {
                name: activity,
                type: 'PLAYING'
            }
        });
    }

    const writeConfigFn = () => {
        console.log('Writing member configs...');
        const content = JSON.stringify(MEMBER_CONFIG, null, 4);
        writeFileSync(configPath, content);
    }

    // This math stuff is one hour in milliseconds
    // This interval makes sure that Taiga keeps playing his games
    setInterval(presenceFn, 1000 * 60 * 60);
    setInterval(writeConfigFn, 1000 * 60 * 60);
    presenceFn();
});

taiga.on('guildMemberAdd', member => {
    const generalChannelIds = [process.env.GENCHN, process.env.TESTGENCHN];
    for (const id of generalChannelIds) {
        if (!id) continue;

        const channel = member.guild.channels.resolve(id);
        if (!channel) continue;

        const greetings = enStrings.texts.greetings;
        const msg = greetings[getRandomInt(0, greetings.length)]
            .replace('{name}', `<@${member.id || member.user!.id}>`);

        (<Discord.TextChannel>channel).send(msg);
    }
});

taiga.on('message', async message => {

    if (message.author.bot || !message.guild) return;

    let config = MEMBER_CONFIG.find(config => config.userId === message.author.id);
    if (config) {
        console.log(config);
        console.log(`Found config.`);
    }
    else {
        MEMBER_CONFIG.push({ user: message.author, userId: message.author.id, lang: 'en' });
        config = MEMBER_CONFIG.find(config => config.userId === message.author.id);
        console.log(`Member config pushed to the array.`);
    }

    const startsWithPrefix = message.content.startsWith(PREFIX);
    const ignoreChannel: string[] = [process.env.VENTCHN!];
    const responseStrings = (config!.lang === 'en') ? enStrings : jpStrings;

    // Don't do anything in venting channel
    if (ignoreChannel.includes(message.channel.id)) return;

    // React to mentions
    ClientUtility.mentionHandler(message);

    // React to messages
    ClientUtility.randomReactionHandler(message);
    ClientUtility.randomUserReactionHandler(message);

    // Randomly edit a message
    ClientUtility.randomEditHandler(message);

    // Randomly reply a message
    const chance = parseInt(process.env.RDMCHANCE!);
    const hitMiss = getRandomInt(0, 100) < chance;
    if (hitMiss && !startsWithPrefix) {
        ClientUtility.randomMsgHandler(message);
    }

    // Admin commands
    if (message.content.startsWith(process.env.ADMIN_PREFIX!) &&
        message.author.id === process.env.ADMIN_ID!) {
        AdminUtility.execute(taiga, message,
            message.content
                .slice(process.env.ADMIN_PREFIX!.length)
                .trim()
                .split(/ +/g));
    }

    if (!startsWithPrefix) return;
    if (((process.env.BOTCHN && process.env.BOTMODCHN) &&
        (message.channel.id != process.env.BOTCHN &&
        message.channel.id != process.env.BOTMODCHN)) &&
        (process.env.TESTCHN && message.channel.id != process.env.TESTCHN)) {
        return;
    }

    // Get the command name. or return
    const args = message.content
        .slice(PREFIX.length)
        .trim()
        .split(/ +/g);

    const cmd = args.shift()?.toLowerCase()!;
    if (!cmd) return;

    // Find command or alias
    let command = COMMANDS.get(cmd);

    if (!command && ALIASES.has(cmd)) {
        command = COMMANDS.get(ALIASES.get(cmd)!);
    }

    // If we still didn't find a command, fail the command and return.
    if (!command) {
        const failedMessage = responseStrings.texts.failed_messages;
        const msg = failedMessage[getRandomInt(0, failedMessage.length)]
            .replace('{command}', cmd);
        message.channel.send(msg);
        return;
    }

    // Add the command to the cooldown
    if (!COOLDOWNS.has(command!.Name)) {
        COOLDOWNS.set(command!.Name, new Discord.Collection<string, number>());
    }

    // Set the cooldown's timestamp
    const now = Date.now();
    const timestamps = COOLDOWNS.get(command!.Name)!;
    const cooldownAmount = (command!.Cooldown || 3) * 1000;

    // Check if the user is on cooldown
    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id)! + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            let cooldownMsg = responseStrings.texts.cooldown;
            cooldownMsg = cooldownMsg.replace('{timeLeft}', timeLeft.toFixed(1));
            cooldownMsg = cooldownMsg.replace('{cmd}', command!.Name);
            message
                .reply(cooldownMsg);
            return;
        }
    }

    // Add the author to the cooldown timestamps,
    // then remove the command after cooldown expires.
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    // Execute the command, and catch errors.
    try {
        await command!.run(taiga, message, args);
    } catch (error) {
        console.error(error);
        message.reply(responseStrings.texts.execution_failure);
    }
});

taiga.login(process.env.TOKEN).catch(console.error);