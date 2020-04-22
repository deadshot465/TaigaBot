import * as Discord from 'discord.js';
import * as DotEnv from 'dotenv';
import { readdirSync } from 'fs';
import Command from './commands/base/command';
import { FAILED_MESSAGES, GREETINGS, RANDOM_RESPONSES } from './storage/reactions';
import { getRandomInt } from './utility/helper';

// Configures the environment variables
DotEnv.config();

export const PREFIX = process.env.PREFIX || '!';

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

export const COMMANDS = new Discord.Collection<string, Command>();
export const ALIASES = new Discord.Collection<string, string>();
export const COOLDOWNS = new Discord.Collection<string, Discord.Collection<string, number>>();

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

// Initialize the bot's startup
taiga.once('ready', () => {
    console.log('Connected');
    console.log(`Logged in as: ${taiga.user?.username} - (${taiga.user?.id})`);
    console.log(`Hello, ${taiga.user?.username} is now online.`);

    const presenceFn = () => {
        console.log('Setting presence');

        taiga.user?.setPresence({
            status: 'invisible',
            activity: {
                name: 'Handcrafting',
                type: 'PLAYING'
            }
        });
    }

    // This math stuff is one hour in milliseconds
    // This interval makes sure that Taiga keeps playing his games
    setInterval(presenceFn, 1000 * 60 * 60);
    presenceFn();
});

taiga.on('guildMemberAdd', member => {
    const generalChannelIds = [process.env.GENCHN, process.env.TESTGENCHN];
    for (const id of generalChannelIds) {
        if (!id) continue;

        const channel = member.guild.channels.resolve(id);
        if (!channel) continue;

        const msg = GREETINGS[getRandomInt(0, GREETINGS.length)]
            .replace('{name}', `<@${member.id || member.user!.id}>`);

        (<Discord.TextChannel>channel).send(msg);
    }
});

taiga.on('message', async message => {
    if (message.author.bot || !message.guild) return;

    const startsWithPrefix = message.content.startsWith(PREFIX);

    // Randomly reply a message
    const chance = parseInt(process.env.RDMCHANCE!);
    const hitMiss = getRandomInt(0, 100) < chance;
    if (hitMiss && !startsWithPrefix) {
        const response = RANDOM_RESPONSES[getRandomInt(0, RANDOM_RESPONSES.length)];
        message.channel.send(response);
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
        const msg = FAILED_MESSAGES[getRandomInt(0, FAILED_MESSAGES.length)];
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
            message
                .reply(`You dumbass need ${timeLeft.toFixed(1)} more second(s) before telling me to do the \`${command!.Name}\` command again.`);
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
        message.reply('There was an error trying to execute that command!');
    }
});

taiga.login(process.env.TOKEN).catch(console.error);