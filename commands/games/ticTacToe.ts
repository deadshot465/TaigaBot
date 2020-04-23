// Copyright(C) 2020 Tetsuki Syu
// See bot.ts for the full notice.

import * as Discord from 'discord.js';
import * as fs from 'fs';
import { getHorizontalLines, sleep, getRandomInt } from '../../utility/helper';
import Game from '../base/game';

const VERTICAL_LENGTH = 3;
const HORIZONTAL_LENGTH = 3;
const EMPTY_SLOT = '\u25a1';
const CIRCLE = '\u25cb';
const CROSS = '\u2573';
const FILE_PATH = '../storage/ticTacToe.json';

enum GameState {
    Off, Starting, PlayerTurn, TaigaTurn
}

enum GameResult {
    NotOver, CircleWin, CrossWin, Draw
}

enum Difficulty {
    Easy, Hard
}

class Mark {
    public Mark: string;
    public IsOccupied = false;

    constructor(mark: string = EMPTY_SLOT) {
        this.Mark = mark;
    }
}

type Board = Array<Array<Mark>>;

interface Coordinate {
    X: number;
    Y: number;
}

class GameStatus {
    public State: GameState;
    public Board: Board | null | undefined;

    constructor(state: GameState) {
        this.State = state;
    }
}

export default class TicTacToe extends Game {
    #state = GameState.Off;
    #timer = Date.now() / 1000;
    
    static MoveFirst = new Discord.Collection<Discord.User, boolean | undefined>();
    static Difficulty = new Discord.Collection<Discord.User, Difficulty | undefined>();
    static GameStatuses = new Discord.Collection<Discord.User, GameStatus>();
    static InputX = new Discord.Collection<Discord.User, number | undefined>();
    static InputY = new Discord.Collection<Discord.User, number | undefined>();

    constructor() {
        super('tictactoe', 'A classic tic tac toe game. Game will be cancelled if there are not reactions in 30 seconds.');
    }

    async run(client: Discord.Client, message: Discord.Message) {
        const { channel } = message;
        const player = message.author;
        
        await channel.send(`So you're in for a game, huh? <:TaigaSmug:702210822310723614> Bring it on!`)
            .then(msg => {
                msg.channel.send(`Reply 0 or 1 in 5 seconds to select if you want to go first (0) or later (1).`);
            });

        client.on('message', this.waitForMoveFirstChoice);
        await this.pause();

        if (TicTacToe.MoveFirst.get(player) === undefined) {
            channel.send(`Invalid choice. Aborting the game...`);
            this.uninitialize(client, player);
            return;
        }

        client.off('message', this.waitForMoveFirstChoice);
        const moveFirst = TicTacToe.MoveFirst.get(player)!;

        await channel.send(`You will move ${moveFirst ? 'first' : 'later'}.`)
            .then(msg => {
                msg.channel.send(`Reply 0 (Easy) or 1 (Hard) in 5 seconds to select the difficulty.`);
            });

        client.on('message', this.waitForDifficultyChoice);
        await this.pause();

        if (TicTacToe.Difficulty.get(player) === undefined) {
            channel.send(`Invalid choice. Aborting the game...`);
            this.uninitialize(client, player);
            return;
        }

        client.off('message', this.waitForDifficultyChoice);
        const difficulty = TicTacToe.Difficulty.get(player)!;

        await channel.send(`You select the difficulty: ${difficulty === Difficulty.Easy ? 'Easy' : 'Hard'}.`);

        this.#state = GameState.Starting;
        this.initialize(player);

        this.drawBoard(message);

        channel.send(`Game Start!`)
            .then(msg => {
                this.#state = moveFirst ? GameState.PlayerTurn : GameState.TaigaTurn;
                this.play(client, msg, player);
                this.uninitialize(client, player);
            });
    }

    protected initialize(user: Discord.User) {
        if (this.#state === GameState.Off) return;

        TicTacToe.GameStatuses.set(user, new GameStatus(this.#state));
        TicTacToe.GameStatuses.get(user)!.Board = new Array<Array<Mark>>(VERTICAL_LENGTH);
        let board = TicTacToe.GameStatuses.get(user)!.Board!;

        for (let y = 0; y < board.length; y++) {
            board[y] = new Array<Mark>(HORIZONTAL_LENGTH);

            for (let x = 0; x < HORIZONTAL_LENGTH; x++) {
                board[y][x] = new Mark();
            }
        }
    }

    protected uninitialize(client: Discord.Client, user: Discord.User) {
        client.off('message', this.waitForMoveFirstChoice);
        client.off('message', this.waitForDifficultyChoice);
        client.off('message', this.waitForXInput);
        client.off('message', this.waitForYInput);
        TicTacToe.MoveFirst.delete(user);
        TicTacToe.Difficulty.delete(user);
        TicTacToe.GameStatuses.delete(user);
        TicTacToe.InputX.delete(user);
        TicTacToe.InputY.delete(user);
    }

    private waitForMoveFirstChoice(msg: Discord.Message) {
        if (msg.author.bot) return;

        const reply = msg.content.trim();
        if (/\d{1}/g.test(reply)) {
            const inputNumber = parseInt(reply);
            if (inputNumber < 0 || inputNumber > 1) return;
            TicTacToe.MoveFirst.set(msg.author, (inputNumber === 0) ? true : false);
        }
    }

    private waitForDifficultyChoice(msg: Discord.Message) {
        if (msg.author.bot) return;

        const reply = msg.content.trim();
        if (/\d{1}/g.test(msg.content.trim())) {
            const inputNumber = parseInt(reply);
            if (inputNumber < 0 || inputNumber > 1) return;
            TicTacToe.Difficulty
                .set(msg.author, (inputNumber === 0) ? Difficulty.Easy : Difficulty.Hard);
        }
    }

    private drawBoard(message: Discord.Message) {

        let msg = '';
        let board = TicTacToe.GameStatuses.get(message.author)!.Board!;

        board.forEach(row => {
            row.forEach(col => {
                msg += col.Mark + ' '
            });
            msg += '\n';
        });

        const embed = new Discord.MessageEmbed()
            .setAuthor(message.author.username, message.author.avatarURL({ format: 'png' })!)
            .setColor(message.member!.displayHexColor)
            .setTitle('Current Game Board')
            .setDescription(msg);

        message.channel.send(embed);
    }

    private waitForYInput(msg: Discord.Message) {
        if (msg.author.bot) return;

        const reply = msg.content.trim();
        if (/\d{1}/g.test(msg.content.trim())) {
            const inputNumber = parseInt(reply);
            if (inputNumber < 1 || inputNumber > 3) return;
            TicTacToe.InputY.set(msg.author, inputNumber);
        }
    }

    private waitForXInput(msg: Discord.Message) {
        if (msg.author.bot) return;

        const reply = msg.content.trim();
        if (/\d{1}/g.test(msg.content.trim())) {
            const inputNumber = parseInt(reply);
            if (inputNumber < 1 || inputNumber > 3) return;
            TicTacToe.InputX.set(msg.author, inputNumber);
        }
    }

    private async pause() {
        return sleep(5 * 1000);
    }

    private async waitForAllInput(client: Discord.Client, message: Discord.Message): Promise<Coordinate> {

        const { channel } = message;

        client.on('message', this.waitForYInput);
        await this.pause();

        if (TicTacToe.InputY.get(message.author)! === undefined) {
            channel.send(`Invalid input. Try again.`);
            //this.uninitialize(client);
            //return;
            await this.pause();
        }

        const inputY = TicTacToe.InputY.get(message.author)! - 1;
        channel.send(`Type the column number (1 to 3) in 5 seconds.`);
        client.off('message', this.waitForYInput);
        client.on('message', this.waitForXInput);
        await this.pause();

        if (TicTacToe.InputX.get(message.author)! === undefined) {
            channel.send(`Invalid input. Try again.`);
            //this.uninitialize(client);
            //return;
            await this.pause();
        }

        const inputX = TicTacToe.InputX.get(message.author)! - 1;
        client.off('message', this.waitForXInput);

        return { X: inputX, Y: inputY };
    }

    private easyModeRandomPick(): Coordinate {
        return { X: getRandomInt(0, HORIZONTAL_LENGTH), Y: getRandomInt(0, VERTICAL_LENGTH) };
    }

    private areMarksEqual(a: Mark, b: Mark, c: Mark): boolean {
        if (a.Mark === EMPTY_SLOT || b.Mark === EMPTY_SLOT || c.Mark === EMPTY_SLOT)
            return false;
        if (a.Mark !== b.Mark) return false;
        if (b.Mark !== c.Mark) return false;
        if (a.Mark !== c.Mark) return false;
        return true;
    }

    private checkResult(message: Discord.Message): GameResult {
        let result: GameResult;
        let board = TicTacToe.GameStatuses.get(message.author)!.Board!;

        for (let y = 0; y < VERTICAL_LENGTH; y++) {
            if (this.areMarksEqual(board[y][0], board[y][1], board[y][2])) {
                if (board[y][0].Mark === CIRCLE)
                    return GameResult.CircleWin;
                else if (board[y][0].Mark === CROSS)
                    return GameResult.CrossWin;
            }
            if (this.areMarksEqual(board[0][y], board[1][y], board[2][y])) {
                if (board[0][y].Mark === CIRCLE)
                    return GameResult.CircleWin;
                else if (board[0][y].Mark === CROSS)
                    return GameResult.CrossWin;
            }
        }

        if (this.areMarksEqual(board[VERTICAL_LENGTH - 1][0], board[VERTICAL_LENGTH - 2][1], board[VERTICAL_LENGTH - 3][2])) {
            if (board[VERTICAL_LENGTH - 1][0].Mark === CIRCLE)
                return GameResult.CircleWin;
            else if (board[VERTICAL_LENGTH - 1][0].Mark === CROSS)
                return GameResult.CrossWin;
        }

        if (this.areMarksEqual(board[0][0], board[1][1], board[2][2])) {
            if (board[0][0].Mark === CIRCLE)
                return GameResult.CircleWin;
            else if (board[0][0].Mark === CROSS)
                return GameResult.CrossWin;
        }

        for (let y = 0; y < VERTICAL_LENGTH; y++) {
            for (let x = 0; x < HORIZONTAL_LENGTH; x++) {
                if (!(board[y][x].IsOccupied))
                    return GameResult.NotOver;
            }
        }

        return GameResult.Draw;
    }

    private async play(client: Discord.Client, message: Discord.Message, player: Discord.User) {
        const { channel } = message;
        let board = TicTacToe.GameStatuses.get(player)!.Board!;

        if (this.#state === GameState.PlayerTurn) {
            channel.send(`It's your turn. Type the row number (1 to 3) in 5 seconds.`);

            let input = await this.waitForAllInput(client, message);

            while (input && board[input.Y][input.X].IsOccupied) {
                channel.send(`Space is occupied. Try again.`);
                input = await this.waitForAllInput(client, message);
            }

            board[input.Y][input.X].Mark = CIRCLE;
            board[input.Y][input.X].IsOccupied = true;
            this.drawBoard(message);
            TicTacToe.InputX.set(player, undefined);
            TicTacToe.InputY.set(player, undefined);

            this.#state = GameState.TaigaTurn;
        }
        else {
            channel.send(`It's MY turn! <:TaigaSmug:702210822310723614>`);

            if (TicTacToe.Difficulty.get(player)! === Difficulty.Easy) {
                let input: Coordinate;

                do {
                    input = this.easyModeRandomPick();
                } while (board[input.Y][input.X].IsOccupied);

                board[input.Y][input.X].Mark = CROSS;
                board[input.Y][input.X].IsOccupied = true;
                this.drawBoard(message);

                this.#state = GameState.PlayerTurn;
            }
        }

        const result = this.checkResult(message);
        switch (result) {
            case GameResult.Draw:
                channel.send(`Hah! Guess you're not that bad after all! It's a draw!`);
                return;
            case GameResult.CircleWin:
                channel.send(`Shit! You'd better not let your guard down! I'll get to you next time! <:TaigaAnnoyed:702646568146436187>`);
                return;
            case GameResult.CrossWin:
                channel.send(`Amateurs! <:TaigaSmug:702210822310723614>`);
                return;
            default:
                this.play(client, message, player);
        }
    }
}