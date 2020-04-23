// Copyright(C) 2020 Tetsuki Syu
// See bot.ts for the full notice.

import * as Discord from 'discord.js';
import { DISCORD_ID, USER_MENTION, USER_TAG } from './patterns';

export function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

export function hexStringToInt(hex: string): number {
    return Number.parseInt(`0x${hex.substring(1)}`);
}

export function getHorizontalLines(amount: number): string {
    let line = '';
    for (let i = 0; i < amount; i++) {
        line += '-';
    }
    return line;
}

/**
 * Helper method to make your code have a delay without having to nest
 *
 * @param milliseconds {int}
 * @returns {Promise<void>}
 */
export function sleep(milliseconds: number) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

export function findMembers(query: string, guild: Discord.Guild | null) {
    if (!(guild instanceof Discord.Guild)) {
        throw new Error('Guild parameter is not a Discord guild.');
    }

    return genericUserCacheSearch(query, guild!.members, 'displayName');
}

export function equalsIgnoreCase(str1: string, str2: string) {
    return str1.toUpperCase() === str2.toUpperCase();
}

export function escapeUsername(user: Discord.GuildMember | Discord.User) {
    let name: string;

    if (user instanceof Discord.GuildMember) {
        name = user.displayName;
    }
    else if (user instanceof Discord.User) {
        name = user.username;
    }
    else {
        throw new Error('User must be a member or a user.');
    }

    return name;
}

function genericUserCacheSearch(query: string, resolver: Discord.GuildMemberManager,
    nameKey = 'username') {
    if (!query)
        return [];

    let singleMatch: Discord.GuildMember | null = null;

    if (USER_MENTION.test(query)) {
        const userId = USER_MENTION.exec(query)![1];
        singleMatch = resolver.resolve(userId);
    }
    else if (USER_TAG.test(query)) {
        const [, username, discriminator] = USER_TAG.exec(query)!;

        singleMatch = resolver.cache.find(u => {
            const userModel = u.user || u;

            return ((userModel.username === username || u[nameKey] === username) &&
                userModel.discriminator === discriminator);
        }) || null;
    }
    else if (DISCORD_ID.test(query)) {
        const userId = DISCORD_ID.exec(query)![0];
        singleMatch = resolver.resolve(userId);
    }

    if (singleMatch)
        return [singleMatch];

    const exactMatch = new Array<Discord.GuildMember>();
    const wrongCase = new Array<Discord.GuildMember>();
    const startsWith = new Array<Discord.GuildMember>();
    const contains = new Array<Discord.GuildMember>();
    const lowerQuery = query.toLowerCase();

    for (const [, user] of resolver.cache) {
        const { username } = user.user || user;
        const name: string = user[nameKey];

        if (name === query || username === query) {
            exactMatch.push(user);
        }
        else if (
            (equalsIgnoreCase(name, query) || equalsIgnoreCase(username, query)) &&
            !exactMatch.length
        ) {
            wrongCase.push(user);
        }
        else if (
            (name.toLowerCase().startsWith(lowerQuery) ||
                username.toLowerCase().startsWith(lowerQuery)) &&
            !wrongCase.length
        ) {
            startsWith.push(user);
        }
        else if (
            (name.toLowerCase().includes(lowerQuery) ||
                username.toLowerCase().includes(lowerQuery)) &&
            !startsWith.length
        ) {
            contains.push(user);
        }
    }

    return [...exactMatch, ...wrongCase, ...startsWith, ...contains];
}