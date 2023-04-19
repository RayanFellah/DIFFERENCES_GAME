/* eslint-disable max-params */
import { ID_LENGTH } from '@app/constants';
import { HistoryInterface } from '@app/model/schema/history.schema';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { GameLogicService } from '@app/services/game-logic/game-logic.service';
import { SheetService } from '@app/services/sheet/sheet.service';
import { LIMITED_TIME_COOP, LIMITED_TIME_SOLO } from '@common/game-types';
import { LimitedTimeRoom } from '@common/limited-time-room';
import { Player } from '@common/player';
import { Sheet } from '@common/sheet';
import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import * as path from 'path';
import { Socket } from 'socket.io';

@Injectable()
export class GatewayLogicService {
    constructor(
        private readonly gameHistoryService: GameHistoryService,
        private readonly sheetService: SheetService,
        private gameService: GameLogicService,
    ) {}

    async getAllSheets(): Promise<Sheet[]> {
        return this.sheetService.getAllSheets();
    }

    createHistoryForWin(room: LimitedTimeRoom, player: Player) {
        const mode = room.mode === LIMITED_TIME_SOLO ? LIMITED_TIME_SOLO : LIMITED_TIME_COOP;
        let playerLeft;
        if (player.socketId === room.player1?.socketId) {
            playerLeft = room.player2?.name;
        } else {
            playerLeft = room.player1?.name;
        }

        const history: HistoryInterface = {
            gameStart: this.getFullDate(room.startTime),
            duration: this.elapsedTime(room.startTime),
            gameMode: mode,
            player1: player.name,
            player2: playerLeft,
            winner1: true,
            gaveUp1: false,
            winner2: false,
            gaveUp2: true,
        };
        if (room.playersInRoom === 2) {
            history.winner2 = true;
            history.gaveUp2 = false;
        }

        if (room.mode === LIMITED_TIME_SOLO) {
            history.player2 = undefined;
        }
        this.gameHistoryService.addHistory(history);
    }

    createHistoryForGameExpired(room: LimitedTimeRoom, player: Player, allyGaveUp: boolean) {
        const mode = room.mode === LIMITED_TIME_SOLO ? LIMITED_TIME_SOLO : LIMITED_TIME_COOP;
        const history: HistoryInterface = {
            gameStart: this.getFullDate(room.startTime),
            duration: this.elapsedTime(room.startTime),
            gameMode: mode,
            player1: room.player1?.name,
            player2: room.player2?.name,
            winner1: false,
            gaveUp1: room.player2?.socketId === player.socketId && allyGaveUp,
            winner2: false,
            gaveUp2: room.player1?.socketId === player.socketId && allyGaveUp,
        };
        this.gameHistoryService.addHistory(history);
    }

    createHistoryForDesertedRoom(room: LimitedTimeRoom) {
        const mode = room.mode === LIMITED_TIME_SOLO ? LIMITED_TIME_SOLO : LIMITED_TIME_COOP;

        const history: HistoryInterface = {
            gameStart: room.startTime.toLocaleTimeString(),
            duration: this.elapsedTime(room.startTime),
            gameMode: mode,
            player1: room.player1.name,
            player2: room.player2 ? room.player2.name : undefined,
            winner1: false,
            gaveUp1: true,
            winner2: false,
            gaveUp2: true,
        };
        this.gameHistoryService.addHistory(history);
    }

    getRandomSheet(availableSheets: Sheet[]): Sheet {
        const randomIdx = Math.floor(Math.random() * availableSheets.length);
        return availableSheets[randomIdx];
    }

    generateRandomId(length: number): string {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;

        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    async createRoom(client: Socket, payload, gameMode: string, rooms: LimitedTimeRoom[], availableSheets: Sheet[]) {
        const sheet = this.getRandomSheet(availableSheets);
        const diffs = await this.gameService.getAllDifferences(sheet);
        const room: LimitedTimeRoom = {
            roomName: this.generateRandomId(ID_LENGTH),
            player1: payload.player,
            player2: undefined,
            currentSheet: sheet,
            timeLimit: payload.timeLimit,
            timeBonus: payload.timeBonus,
            hintsLeft: payload.hintsLeft,
            isGameDone: false,
            currentDifferences: diffs,
            usedSheets: [sheet._id],
            mode: gameMode,
            hasStarted: false,
            startTime: new Date(),
            playersInRoom: 1,
            timeLeft: payload.timeLimit,
        };
        rooms.push(room);
        client.join(room.roomName);
        return room;
    }
    createImageBuffer(imagePath: string) {
        const imgPath = path.join(process.cwd(), 'uploads', imagePath);
        const fileContent = readFileSync(imgPath);
        return fileContent;
    }
    async rerollSheet(room: LimitedTimeRoom, availableSheets: Sheet[], player: Player) {
        if (room.usedSheets.length === availableSheets.length) {
            room.isGameDone = true;
            this.createHistoryForWin(room, player);
            return;
        }

        let randomSheet = this.getRandomSheet(availableSheets);
        while (room.usedSheets.includes(randomSheet._id)) {
            randomSheet = this.getRandomSheet(availableSheets);
        }
        const newDiffs = await this.gameService.getAllDifferences(randomSheet);
        room.currentDifferences = newDiffs;
        room.currentSheet = randomSheet;
        room.usedSheets.push(randomSheet._id);
    }

    findRoomToJoin(rooms: LimitedTimeRoom[]) {
        return rooms.find((iter) => iter.playersInRoom === 1 && iter.mode === LIMITED_TIME_COOP && !iter.hasStarted);
    }

    private elapsedTime(startTime: Date): string {
        const MILLISECONDS = 1000;
        const MINUTES = 60;
        const elapsedTimeInSeconds = Math.floor((new Date().getTime() - startTime.getTime()) / MILLISECONDS);
        const minutes = Math.floor(elapsedTimeInSeconds / MINUTES);
        const seconds = elapsedTimeInSeconds % MINUTES;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    private getFullDate(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const time = date.toLocaleTimeString();
        return `${year}/${month}/${day} ${time}`;
    }
}
