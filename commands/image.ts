import Axios, { AxiosError } from 'axios';
import * as Discord from 'discord.js';
import IUnsplashSearchResult from '../interfaces/IUnsplashSearchResult';
import { getRandomInt } from '../utility/helper';
import Command from './base/command';

const UNSPLASH_ITEM_PER_PAGE = 10;

export default class Image extends Command {
    constructor() {
        super('image', 'util', 'Get a random image based on a keyword',
            `Run \`image <keyword>\` to get a random image. Only one keyword is permitted.`,
            ['img']);
    }

    async run(client: Discord.Client, message: Discord.Message, args: string[]) {
        const { channel } = message;
        let keyword = '';

        if (args.length > 1) {
            channel.send(`I told you that only one keyword can be used. You're really dumb. <:TaigaAnnoyed:702646568146436187>`);
            return;
        }
        else if (args.length <= 0) {
            channel.send(`Did you read the help? No keyword! I'd just give you a burger.`);
            keyword = 'hamburger';
        }
        else {
            keyword = args.shift()!.toLowerCase();
        }

        const attachment = await Image.getImage(keyword)
        if (attachment) {
            if (attachment instanceof Discord.MessageAttachment)
                message.reply(`Here is your image for ${keyword}`, attachment);
            else
                message.reply(attachment);
        }
    }

    static async getImage(keyword: string): Promise<Discord.MessageAttachment | string | null | undefined> {
        let token = process.env.UNSPLASH_TOKEN;
        let attachment: Discord.MessageAttachment | null | undefined;

        if (token) {
            let link: string;
            let total = 0;
            let totalPages = 0;

            console.log(`Keyword: ${keyword}`);

            try {
                let response = await Axios.get(`https://api.unsplash.com/search/photos?client_id=${token}&query=${keyword}&page=1`)
                    .then(res => {
                        const data = res.data as IUnsplashSearchResult;
                        total = data.total;
                        totalPages = data.total_pages;
                    });

                console.log(`Total: ${total}`);

                if (!total) {
                    return `Sorry. Not my problem. Your keyword is too weird that I can't find any image.`;
                }

                const randomPageNumber = getRandomInt(0, totalPages + 1);

                response = await Axios.get(`https://api.unsplash.com/search/photos?client_id=${token}&query=${keyword}&page=${randomPageNumber}`)
                    .then(res => {
                        const data = res.data as IUnsplashSearchResult;
                        const mod = data.total % UNSPLASH_ITEM_PER_PAGE;
                        const itemNo = (randomPageNumber == totalPages) ?
                            getRandomInt(0, mod) : getRandomInt(0, UNSPLASH_ITEM_PER_PAGE);
                        link = data.results[itemNo].urls.regular;
                    });

                const photo = await Axios.get(`${link!}`, {
                    headers: {
                        'Accept': 'image/jpeg',
                        'Content-Type': 'image/jpeg'
                    },
                    responseType: 'arraybuffer'
                });

                attachment = new Discord.MessageAttachment(Buffer.from(photo.data), 'image.jpg');
                return attachment;
            } catch (e) {
                return `An error occured. I blame Rhakon again. <:TaigaLOL:700004692079542333> - ${JSON.parse((<AxiosError>e).response!.data).message}`;
            }
        }
        else
            return null;
    }
}