import Discord = require('discord.io');
import logger = require('winston');
import auth = require('./auth.json');
import convert from './commands/convert';
import { TAIGA_MESSAGES } from './database/dumpStorage';
import { getRandomInt } from './helper';
import { initializeCharacters, ENDINGS } from './objects/character';
import getNextRoute from './commands/route';
import getValentine from './commands/valentine';

logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console);
logger.level = 'debug';

let bot = new Discord.Client({
    token: auth.token,
    autorun: true
});

bot.on('ready', (evt) => {
    logger.info('Connected');
    logger.info(`Logged in as: ${bot.username} - (${bot.id})`);
});

initializeCharacters();

bot.on('message', (user, userID, channelID, message, evt) => {
    if (message.substring(0, 1) == '>') {
        let args = message.substring(1).split(/\s+/g);
        let cmd = args[0];

        args = args.splice(1);

        switch (cmd) {
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: 'Pong!'
                });
                break;
            case 'cvt':
                {
                    let result = convert(args[0], args[1]);
                    bot.sendMessage({
                        to: channelID,
                        message: result
                    });
                    
                }
                break;
            case 'route':
                {
                    let character = getNextRoute();

                    bot.sendMessage({
                        to: channelID,
                        embed: {
                            thumbnail: {
                                url: character.getEmojiUrlGif()
                            },
                            color: character.getColor(),
                            title: `Next: ${character.getName()}, ${ENDINGS[getRandomInt(0, ENDINGS.length)]} Ending`,
                            description: character.getDescription(),
                            fields: [
                                {
                                    name: 'Age', value: character.getAge().toString(), inline: true
                                },
                                {
                                    name: 'Birthday', value: character.getBirthday(), inline: true
                                },
                                {
                                    name: 'Animal Motif', value: character.getAnimal(), inline: true
                                }
                            ],
                            footer: {
                                text: `Play ${character.getFirstName()}'s route next. All bois are best bois.`
                            }
                        }
                    });
                }
                break;
            case 'valentine':
                {
                    let valentine = getValentine();
                    let isKeitaro = valentine.getFirstName() === 'Keitaro';
                    let prefixSuffix = isKeitaro ? "~~" : "";

                    bot.sendMessage({
                        to: channelID,
                        message: !isKeitaro ? "" : "**Bah, we're already dating and I'm the best. No chance for you, loser.**",
                        embed: {
                            thumbnail: {
                                url: valentine.getEmojiUrlPng()
                            },
                            color: valentine.getColor(),
                            title: `${prefixSuffix}Your valentine is ${valentine.getName()}${prefixSuffix}`,
                            description: `${prefixSuffix}${valentine.getDescription()}${prefixSuffix}`,
                            fields: [
                                {
                                    name: 'Age',
                                    value: `${prefixSuffix}${valentine.getAge().toString()}${prefixSuffix}`,
                                    inline: true
                                },
                                {
                                    name: 'Birthday',
                                    value: `${prefixSuffix}${valentine.getBirthday()}${prefixSuffix}`,
                                    inline: true
                                },
                                {
                                    name: 'Animal Motif',
                                    value: `${prefixSuffix}${valentine.getAnimal()}${prefixSuffix}`,
                                    inline: true
                                }
                            ],
                            footer: {
                                text: !isKeitaro ?
                                    `Don't fret if ${valentine.getFirstName()} isn't your type. Who knows, maybe it's time for a new favorite.` :
                                    `See? Told you Keitaro is my boyfriend. Later loser.`
                            }
                        }
                    });
                }
                break;
            default:
                bot.sendMessage({
                    to: channelID,
                    message: TAIGA_MESSAGES[getRandomInt(0, TAIGA_MESSAGES.length)]
                });
                break;
        }
    }
});