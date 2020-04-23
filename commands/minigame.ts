import * as Discord from 'discord.js';
import * as fs from 'fs';
import Command from './base/command';
import Game from './base/game';

//export default class Minigame extends Command {

//    #gameLists: Discord.Collection<string, Game>;

//    constructor() {
//        super('minigame', 'game', 'Play some fun game with Taiga (experimental).',
//            `Run \`minigame <game>\` to begin a new game, if it exists. Run \`minigame list\` to list possible games.`,
//            ['game']);

//        this.#gameLists = new Discord.Collection<string, Game>();
//    }

//    async run(client: Discord.Client, message: Discord.Message, args: string[]) {

//        const { channel } = message;
//        const gameName = args[0] || 'list';

//        await this.readGames().catch(console.error);

//        const gameLists = this.#gameLists.map(game => {
//            return ` - \`${game.Name}:\` *${game.Description}*`;
//        }).join('\n');

//        if (gameName === 'list') {
//            channel.send(`Here is the list of all games and their descriptions:\n${gameLists}`);
//            return;
//        }

//        let game = this.#gameLists.get(gameName);

//        if (!game) {
//            message.reply('There is no such game in my server.');
//            return;
//        }

//        await game.run(client, message).catch(console.error);
//    }

//    private async readGames() {
//        const games = fs.readdirSync('./commands/games/').filter(file => file.endsWith('.js'));
//        for (const game of games) {
//            const { default: ctor } = await import(`./games/${game}`);

//            if (!ctor) continue;

//            if (!((<Function>ctor).prototype instanceof Game)) {
//                console.error(`ERROR: ${game} doesn't extend Game class and is ignored.`);
//                continue;
//            }

//            const _game = new ctor() as Game;
//            this.#gameLists.set(_game.Name, _game);
//        }
//    }
//}