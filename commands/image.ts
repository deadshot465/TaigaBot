// Copyright(C) 2020 Tetsuki Syu
// See bot.ts for the full notice.

import Axios, { AxiosError } from 'axios';
import * as Discord from 'discord.js';
import { MEMBER_CONFIG } from '../bot';
import IMemberConfig from '../interfaces/IMemberConfig';
import IUnsplashSearchResult from '../interfaces/IUnsplashSearchResult';
import * as localizedStrings from '../storage/localizedStrings.json';
import { getRandomInt } from '../utility/helper';
import Command from './base/command';

const UNSPLASH_ITEM_PER_PAGE = 10;
const enStrings = localizedStrings.find(val => val.lang === 'en')!;
const jpStrings = localizedStrings.find(val => val.lang === 'jp')!;

export default class Image extends Command {
    constructor() {

        super('image', 'util', enStrings.texts.image.description,
            enStrings.texts.image.usage,
            ['img']);
    }

    async run(client: Discord.Client, message: Discord.Message, args: string[]) {
        const { channel } = message;
        const config: IMemberConfig = MEMBER_CONFIG.find(config => config.userId === message.author.id)!;
        const imageStrings = (config.lang === 'en') ? enStrings.texts.image : jpStrings.texts.image;
        let keyword = '';

        if (args.length > 1) {
            channel.send(imageStrings.errors.length_too_long);
            return;
        }
        else if (args.length <= 0) {
            channel.send(imageStrings.errors.length_too_short);
            keyword = 'hamburger';
        }
        else {
            keyword = args.shift()!.toLowerCase();
        }

        const attachment = await Image.getImage(keyword, message)
        if (attachment) {
            if (attachment instanceof Discord.MessageAttachment)
            {
                const resultMsg = imageStrings.result.replace('{keyword}', keyword);
                message.reply(resultMsg, attachment);
            }
            else
                message.reply(attachment);
        }
    }

    static async getImage(keyword: string, message: Discord.Message): Promise<Discord.MessageAttachment | string | null | undefined> {

        const config: IMemberConfig = MEMBER_CONFIG.find(config => config.userId === message.author.id)!;
        const imageStrings = (config.lang === 'en') ? enStrings.texts.image : jpStrings.texts.image;

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
                    return imageStrings.errors.no_result;
                }

                // Limit to the first 25% pages.
                const upperPageLimit = Math.ceil(totalPages * 0.25);
                const randomPageNumber = getRandomInt(0, upperPageLimit + 1);

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
                const genericError = imageStrings.errors.generic
                    .replace('{json}', JSON.parse((<AxiosError>e).response!.data).message);
                return genericError;
            }
        }
        else
            return null;
    }
}