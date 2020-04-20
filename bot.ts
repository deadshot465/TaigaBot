import * as Discord from 'discord.js';
import * as DotEnv from 'dotenv';
import { readdirSync } from 'fs';
import Command from './commands/base/command';

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

const commands = new Discord.Collection<string, Command>();
const alias = new Discord.Collection<string, string>();
const cooldowns = new Discord.Collection<string, Discord.Collection<string, number>>();

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
        commands.set(command.Name, command);

        if (command.Alias) {
            command.Alias.forEach(_alias => alias.set(_alias, command.Name));
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
            status: 'online',
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

taiga.on('message', async message => {
    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith(PREFIX)) return;

    // Get the command name. or return
    const args = message.content
        .slice(PREFIX.length)
        .trim()
        .split(/ +/g);

    const cmd = args.shift()?.toLowerCase()!;
    if (!cmd) return;

    // Find command or alias
    let command = commands.get(cmd);

    if (!command && alias.has(cmd)) {
        command = commands.get(alias.get(cmd)!);
    }

    // Add the command to the cooldown
    if (!cooldowns.has(command!.Name)) {
        cooldowns.set(command!.Name, new Discord.Collection<string, number>());
    }

    // Set the cooldown's timestamp
    const now = Date.now();
    const timestamps = cooldowns.get(command!.Name)!;
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

//initializeCharacters();

//bot.on('message', (user, userID, channelID, message, evt) => {
//    if (message.substring(0, 1) == '>') {
//        let args = message.substring(1).split(/\s+/g);
//        let cmd = args[0];

//        args = args.splice(1);

//        switch (cmd) {
//            case 'ping':
//                bot.sendMessage({
//                    to: channelID,
//                    message: 'Pong!'
//                });
//                break;
//            case 'cvt':
//                {
//                    let result = convert(args[0], args[1]);
//                    bot.sendMessage({
//                        to: channelID,
//                        message: result
//                    });
                    
//                }
//                break;
//            case 'route':
//                {
//                    let character = getNextRoute();

//                    bot.sendMessage({
//                        to: channelID,
//                        embed: {
//                            thumbnail: {
//                                url: character.getEmojiUrlGif()
//                            },
//                            color: character.getColor(),
//                            title: `Next: ${character.getName()}, ${ENDINGS[getRandomInt(0, ENDINGS.length)]} Ending`,
//                            description: character.getDescription(),
//                            fields: [
//                                {
//                                    name: 'Age', value: character.getAge().toString(), inline: true
//                                },
//                                {
//                                    name: 'Birthday', value: character.getBirthday(), inline: true
//                                },
//                                {
//                                    name: 'Animal Motif', value: character.getAnimal(), inline: true
//                                }
//                            ],
//                            footer: {
//                                text: `Play ${character.getFirstName()}'s route next. All bois are best bois.`
//                            }
//                        }
//                    });
//                }
//                break;
//            case 'valentine':
//                {
//                    let valentine = getValentine();
//                    let isKeitaro = valentine.getFirstName() === 'Keitaro';
//                    let prefixSuffix = isKeitaro ? "~~" : "";

//                    bot.sendMessage({
//                        to: channelID,
//                        message: !isKeitaro ? "" : "**Bah, we're already dating and I'm the best. No chance for you, loser.**",
//                        embed: {
//                            thumbnail: {
//                                url: valentine.getEmojiUrlPng()
//                            },
//                            color: valentine.getColor(),
//                            title: `${prefixSuffix}Your valentine is ${valentine.getName()}${prefixSuffix}`,
//                            description: `${prefixSuffix}${valentine.getDescription()}${prefixSuffix}`,
//                            fields: [
//                                {
//                                    name: 'Age',
//                                    value: `${prefixSuffix}${valentine.getAge().toString()}${prefixSuffix}`,
//                                    inline: true
//                                },
//                                {
//                                    name: 'Birthday',
//                                    value: `${prefixSuffix}${valentine.getBirthday()}${prefixSuffix}`,
//                                    inline: true
//                                },
//                                {
//                                    name: 'Animal Motif',
//                                    value: `${prefixSuffix}${valentine.getAnimal()}${prefixSuffix}`,
//                                    inline: true
//                                }
//                            ],
//                            footer: {
//                                text: !isKeitaro ?
//                                    `Don't fret if ${valentine.getFirstName()} isn't your type. Who knows, maybe it's time for a new favorite.` :
//                                    `See? Told you Keitaro is my boyfriend. Later loser.`
//                            }
//                        }
//                    });
//                }
//                break;
//            case 'tictactoe':
//                {
//                    let game = new TicTacToeGame(bot, user, userID, channelID);
//                }
//                break;
//            case 'oracle':
//                {
//                    let oracle = getOracle();
//                    bot.sendMessage({
//                        to: channelID,
//                        message: `**Oracle No:** ${oracle.No}\n**Fortune:** ${oracle.Fortune}\n**Summary:** ${oracle.Meaning}\n**Details:**\n *${oracle.Content}*`
//                    });
//                }
//                break;
//            default:
//                bot.sendMessage({
//                    to: channelID,
//                    message: TAIGA_MESSAGES[getRandomInt(0, TAIGA_MESSAGES.length)]
//                });
//                break;
//        }
//    }
//});