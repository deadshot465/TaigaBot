import Axios from 'axios';
import * as Discord from 'discord.js';
import { RANDOM_RESPONSES } from '../storage/reactions';
import { getRandomInt } from './helper';

const SPECIALIZED_CHANCE = 50;
const BACKGROUNDS = [
    "bath", "beach", "cabin", "camp",
    "cave", "forest", "messhall"
];

export default class ClientUtility {
    
    static async randomMsgHandler(message: Discord.Message) {

        const content = message.content.toLowerCase();

        if (this.isSpecialized()) {
            if (content.includes('keitaro')) {
                message.channel.send(`What's your problem with my boyfriend?`);
            }
            else if (content.includes('hiro')) {
                const background = BACKGROUNDS[getRandomInt(0, BACKGROUNDS.length)];
                const response = await Axios.post('https://yuuto.dunctebot.com/dialog',
                    {
                        background: background,
                        character: `hiro`,
                        text: `Hiro will be terribly wrong if he thinks he can steal Keitaro from me!`
                    }, {
                    responseType: 'arraybuffer',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                const attachment = new Discord.MessageAttachment(Buffer.from(response.data), 'result.png');
                message.channel.send(attachment);
            }
            else if (content.includes('hunter')) {
                message.channel.send(`<:KachiSad:701226059726585866> I felt him. I'd be baffled if someone told me to stop handcrafting. I mean how else could I make a bracelet?`);
            }
            else if (content.includes('natsumi')) {
                message.channel.send(`<:TaigaSmug:702210822310723614> I'm still better than him 'cause I'm the best!`);
            }
            else if (content.includes('yoichi')) {
                message.channel.send(`<:TaigaSmug:702210822310723614> *Not my type.*`);
            }
            else if (content.includes('yoshi')) {
                message.channel.send(`<:TaigaAngry:699705315519889479> Stop sticking your nose where it doesn't belong!`);
            }
            else if (content.includes('yuri')) {
                message.channel.send(`<:TaigaAck2:700006264507465778> Get away from us! Although you're not wrong at all...`);
            }
            else if (content.includes('aiden')) {
                const response = await Axios.get(`https://source.unsplash.com/1600x900/?hamburger`);
                const attachment = new Discord.MessageAttachment(Buffer.from(response.data), 'burger.png');
                message.channel.send(`Three orders of double-quarter-pounder cheeseburgers! Two large fries and one large soda!\n` +
                    `Burger patties well-done, three slices of pickles for each! No mayonnaise! Just ketchup and mustard!`)
                    .then(msg => {
                        message.channel.send(attachment);
                    });
            }
            else if (content.includes('goro')) {
                message.channel.send(`So when are you going to confess to Yoshi?`);
            }
        }
        else {
            const response = RANDOM_RESPONSES[getRandomInt(0, RANDOM_RESPONSES.length)];
            message.channel.send(response);
        }
    }

    private static isSpecialized() {
        return getRandomInt(0, 100) < SPECIALIZED_CHANCE;
    }
}