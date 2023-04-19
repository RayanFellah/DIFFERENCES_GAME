/* eslint-disable no-restricted-imports */
import { ID_LENGTH } from '@app/constants';
import { Sheet } from '@app/model/database/sheet';
import { HistoryInterface } from '@app/model/schema/history.schema';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { GameLogicService } from '@app/services/game-logic/game-logic.service';
import { SheetService } from '@app/services/sheet/sheet.service';
import { ChatMessage } from '@common/chat-message';
import { Coord } from '@common/coord';
import { GameEvents } from '@common/game-events';
import { LIMITED_TIME_COOP, LIMITED_TIME_SOLO } from '@common/game-types';
import { LimitedTimeRoom } from '@common/limited-time-room';
import { Player } from '@common/player';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { readFileSync } from 'fs';
import * as path from 'path';
import { Server, Socket } from 'socket.io';
import { ChatEvents } from '../chat/chat.gateway.events';
import { PRIVATE_ROOM_ID } from './chat.gateway.constants';

@WebSocketGateway({ cors: true })
@Injectable()
export class GameGateway implements OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    rooms: LimitedTimeRoom[] = [];
    availableSheets: Sheet[];
    private readonly room = PRIVATE_ROOM_ID;
    constructor(
        readonly logger: Logger,
        readonly sheetService: SheetService,
        public gameService: GameLogicService,
        public gameHistoryService: GameHistoryService,
    ) {
        this.sheetService.getAllSheets().then((sheets) => {
            this.availableSheets = sheets;
        });
    }

    @SubscribeMessage(GameEvents.CreateLimitedTimeSolo)
    async createLimitedSoloGame(client: Socket, payload) {
        payload.player.socketId = client.id;
        const room = await this.createRoom(client, payload, LIMITED_TIME_SOLO);
        room.hasStarted = true;
        const left = this.createImageBuffer(room.currentSheet.originalImagePath);
        const right = this.createImageBuffer(room.currentSheet.modifiedImagePath);
        this.server.to(room.roomName).emit(GameEvents.LimitedTimeRoomCreated, { room, left, right });
    }
    @SubscribeMessage(GameEvents.CreateLimitedTimeCoop)
    async createLimitedCoopGame(client: Socket, payload) {
        payload.player.socketId = client.id;
        const room = this.findRoomToJoin();
        if (room) {
            this.joinAndConfirmCoopGame(client, payload);
            return;
        }
        await this.createRoom(client, payload, LIMITED_TIME_COOP);
    }
    @SubscribeMessage(GameEvents.JoinCoop)
    async joinAndConfirmCoopGame(client: Socket, payload) {
        const room = this.rooms.find((iter) => (iter.player1 === undefined || iter.player2 === undefined) && iter.mode === LIMITED_TIME_COOP);
        client.join(room.roomName);
        room.player2 = payload.player;
        room.player2.socketId = client.id;
        room.playersInRoom = 2;
        const left = this.createImageBuffer(room.currentSheet.originalImagePath);
        const right = this.createImageBuffer(room.currentSheet.modifiedImagePath);
        room.hasStarted = true;
        this.server.to(room.roomName).emit(GameEvents.SecondPlayerJoined, { room, left, right });
    }

    @SubscribeMessage(GameEvents.SheetDeleted)
    removeSheet(socket: Socket, payload) {
        this.availableSheets = this.availableSheets.filter((sheet) => JSON.stringify(sheet._id) !== JSON.stringify(payload._id));
    }
    @SubscribeMessage(GameEvents.CancelGame)
    cancelGame(socket: Socket) {
        console.log('cancel game');
        console.log(this.rooms.length);
        const room = this.rooms.find((iter) => iter.player1.socketId === socket.id);
        this.removeRoom(room);
        console.log(room);
        console.log(this.rooms.length);
    }

    @SubscribeMessage(GameEvents.SheetCreated)
    async updateSheets() {
        const DELAY = 500;
        setTimeout(() => {
            this.sheetService.getAllSheets().then((sheets) => {
                this.availableSheets = sheets;
            });
        }, DELAY);
    } //

    @SubscribeMessage(GameEvents.TimeOut)
    async handleTimeOut(client: Socket, payload) {
        const room: LimitedTimeRoom = this.rooms.find((iter) => iter.roomName === payload.roomName);
        const message = 'Time Out⏲️! Bien essayé!👍';
        console.log(room);
        client.emit(GameEvents.GameOver, message);
        if (room.isGameDone) return;
        room.isGameDone = true;
        this.createHistoryForGameExpired(room, payload.player, payload.allyGaveUp);
    }

    @SubscribeMessage(GameEvents.ClickTL)
    async handleClick(client: Socket, payload) {
        const click: Coord = { posX: payload.click.x, posY: payload.click.y };
        const room: LimitedTimeRoom = this.rooms.find((iter) => iter.roomName === payload.roomName);
        const player = room.player1?.socketId === client.id ? room.player1 : room.player2?.socketId === client.id ? room.player2 : null;
        let diffFound: Coord[] = null;
        let isError = true;
        let left = null;
        let right = null;
        for (const diff of room.currentDifferences) {
            if (diff.coords.find((coord) => JSON.stringify(coord) === JSON.stringify(click))) {
                const message: ChatMessage = { content: ' A Trouvé une différence!', name: player.name, type: 'game' };
                this.server.to(room.roomName).emit(ChatEvents.RoomMessage, message);
                diff.found = true;
                player.differencesFound++;
                diffFound = diff.coords;
                await this.rerollSheet(room, player);
                if (room.isGameDone) {
                    const messageDiff = "Fin de la partie! Vous n'avez laissé aucune fiche!🙌";
                    this.server.to(room.roomName).emit(GameEvents.GameOver, messageDiff);
                    break;
                }
                left = this.createImageBuffer(room.currentSheet.originalImagePath);
                right = this.createImageBuffer(room.currentSheet.modifiedImagePath);
                isError = false;
                break;
            }
        }
        if (isError) {
            const errorMessage: ChatMessage = { content: `ERROR_FROM ${player.name}`, name: player.name, type: 'game' };
            this.server.to(room.roomName).emit(ChatEvents.RoomMessage, errorMessage);
        }
        this.server.to(room.roomName).emit(GameEvents.ClickValidated, { diffFound, room, player, left, right, click: payload.click });
    }

    handleDisconnect(socket: Socket) {
        let player: Player;
        let foundRoom: LimitedTimeRoom;
        for (const room of this.rooms) {
            if (room.player1?.socketId === socket.id || room.player2?.socketId === socket.id) {
                foundRoom = room;
                break;
            }
        }

        if (!foundRoom) {
            return;
        }

        if (foundRoom.player1?.socketId === socket.id) {
            player = foundRoom.player1;
        } else {
            player = foundRoom.player2;
        }

        foundRoom.playersInRoom--;
        socket.leave(foundRoom.roomName);
        this.server.to(foundRoom.roomName).emit(GameEvents.playerLeft, { room: foundRoom, player });
        const message: ChatMessage = { content: 'Ton Allié a quitté la partie😱, Basculé en Mode Solo!', type: 'game' };
        this.server.to(foundRoom.roomName).emit(ChatEvents.RoomMessage, message);
        if (!foundRoom.playersInRoom && !foundRoom.isGameDone) {
            this.createHistoryForDesertedRoom(foundRoom);
            this.removeRoom(foundRoom);
        } else if (foundRoom.isGameDone) {
            this.removeRoom(foundRoom);
        }
    }

    private createHistoryForDesertedRoom(room: LimitedTimeRoom) {
        const mode = room.mode === LIMITED_TIME_SOLO ? LIMITED_TIME_SOLO : LIMITED_TIME_COOP;

        const history: HistoryInterface = {
            gameStart: this.getFullDate(room.startTime),
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

    private getRandomSheet(): Sheet {
        const randomIdx = Math.floor(Math.random() * this.availableSheets.length);
        return this.availableSheets[randomIdx];
    }

    private removeRoom(room: LimitedTimeRoom) {
        this.rooms = this.rooms.filter((iter) => iter.roomName !== room.roomName);
    }

    private generateRandomId(length: number): string {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;

        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    private async createRoom(client: Socket, payload, gameMode: string) {
        const sheet = this.getRandomSheet();
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
        this.rooms.push(room);
        client.join(room.roomName);
        return room;
    }
    private createImageBuffer(imagePath: string) {
        const imgPath = path.join(process.cwd(), 'uploads', imagePath);
        const fileContent = readFileSync(imgPath);
        return fileContent;
    }
    private async rerollSheet(room: LimitedTimeRoom, player: Player) {
        if (room.usedSheets.length === this.availableSheets.length) {
            room.isGameDone = true;
            this.createHistoryForWin(room, player);
            return;
        }

        let randomSheet = this.getRandomSheet();
        while (room.usedSheets.includes(randomSheet._id)) {
            randomSheet = this.getRandomSheet();
        }
        const newDiffs = await this.gameService.getAllDifferences(randomSheet);
        room.currentDifferences = newDiffs;
        room.currentSheet = randomSheet;
        room.usedSheets.push(randomSheet._id);
    }

    private findRoomToJoin() {
        return this.rooms.find((iter) => iter.playersInRoom === 1 && iter.mode === LIMITED_TIME_COOP && !iter.hasStarted);
    }

    // chrono is finished
    private createHistoryForGameExpired(room: LimitedTimeRoom, player: Player, allyGaveUp: boolean) {
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
        console.log(history);
        this.gameHistoryService.addHistory(history);
    }

    private createHistoryForWin(room: LimitedTimeRoom, player: Player) {
        const mode = room.mode === LIMITED_TIME_SOLO ? LIMITED_TIME_SOLO : LIMITED_TIME_COOP;
        let playerLeft;
        if (player.socketId === room.player1?.socketId) {
            playerLeft = room.player2?.name;
        } else {
            playerLeft = room.player1?.name;
        }

        // coop et l un des players a quitté
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
        // coop et les deux joueurs ont gagne
        if (room.playersInRoom === 2) {
            history.winner2 = true;
            history.gaveUp2 = false;
        }

        // solo gagne
        if (room.mode === LIMITED_TIME_SOLO) {
            history.player2 = undefined;
        }
        this.gameHistoryService.addHistory(history);
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
