// Copyright(C) 2020 Tetsuki Syu
// See bot.ts for the full notice.

import * as Discord from 'discord.js';
import * as fs from 'fs';
import { getHorizontalLines } from '../utility/helper';
import Command from './base/command';

const VERTICAL_LENGTH = 3;
const HORIZONTAL_LENGTH = 3;
const FILE_PATH = '../storage/ticTacToe.json';

enum GameResult {
    CircleWin, CrossWin, Draw
}

enum Difficulty {
    Easy, Hard
}

class Mark {
    public Mark: string;
    public IsOccupied = false;

    constructor(mark: string) {
        this.Mark = mark;
    }
}

declare type Board = Array<Array<Mark>>;

class GameStatus {
    public UserName: string;
    public UserID: string;
    public Board: Board;

    constructor(userName: string, userID: string) {
        this.UserName = userName;
        this.UserID = userID;
    }
}

//export default class TicTacToe extends Command {

//}

class TicTacToeGame {

    private _currentGames = new Array<GameStatus>();
    private _gameID = 0;

    constructor(client: Discord.Client, user: string, userID: string, channelID: string) {

        let firstTimePlay = false;

        fs.readFile(FILE_PATH, (err, data) => {
            if (data == null) return;
            this._currentGames = JSON.parse(data.toString()) as GameStatus[];
        });

        let gameID = this._currentGames.findIndex((value, index, obj) => {
            value.UserID === userID;
        });

        if (gameID === -1) {
            firstTimePlay = true;
            this._currentGames.push(new GameStatus(user, userID));
            this._gameID = this._currentGames.length - 1;
            this._currentGames[this._gameID].Board = new Array<Array<Mark>>(VERTICAL_LENGTH);

            for (let i = 0; i < VERTICAL_LENGTH; i++) {
                this._currentGames[this._gameID].Board[i] = new Array<Mark>(HORIZONTAL_LENGTH);
            }

            for (let i = 0; i < VERTICAL_LENGTH; i++) {
                for (let j = 0; j < HORIZONTAL_LENGTH; j++) {
                    this._currentGames[this._gameID].Board[j][i] = new Mark('\t');
                }
            }
        }

        let msg = getHorizontalLines(20);
        msg += firstTimePlay ? `\nHello! ${user}! Let the game start!\n` :
            `\nYou want to continue the game?\n`;
        msg += getHorizontalLines(20);

        //client.sendMessage({
        //    to: channelID,
        //    message: msg
        //});

        this.runGame(client, user, userID, channelID, firstTimePlay);
    }

    runGame(client: Discord.Client, user: string, userID: string, channelID: string, firstTimePlay: boolean) {

        let msg = this.drawBoard();

        //client.sendMessage({
        //    to: channelID,
        //    message: msg
        //});

        this.endGame();
    }

    endGame() {
        let str = JSON.stringify(this._currentGames);
        fs.writeFile(FILE_PATH, str, (err) => {
            if (err)
                console.error(err.message);
        });
    }

    drawBoard(): string {
        let msg = `\t1\t2\t3\n\t`;
        msg += getHorizontalLines(8);

        for (let i = 0; i < VERTICAL_LENGTH; i++) {

            msg += `${i + 1}|`;

            for (let j = 0; j < HORIZONTAL_LENGTH; j++) {
                msg += `${this._currentGames[this._gameID].Board[j][i].Mark}|`;
            }
            msg += `\n\t`;
            msg += getHorizontalLines(8);
        }

        return msg;
    }
}

export default TicTacToeGame;