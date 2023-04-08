/* eslint-disable no-restricted-imports */
import { ID_LENGTH } from '@app/constants';
import { Sheet } from '@app/model/database/sheet';
import { GameLogicService } from '@app/services/game-logic/game-logic.service';
import { SheetService } from '@app/services/sheet/sheet.service';
import { Coord } from '@common/coord';
import { GameEvents } from '@common/game-events';
import { LimitedTimeRoom } from '@common/limited-time-room';
import { Player } from '@common/player';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { readFileSync } from 'fs';
import * as path from 'path';
import { Server, Socket } from 'socket.io';
import { ChatEvents } from '../chat/chat.gateway.events';
import { DELAY_BEFORE_EMITTING_TIME, PRIVATE_ROOM_ID } from './chat.gateway.constants';
@WebSocketGateway({ cors: true })
@Injectable()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() server: Server;

    rooms: LimitedTimeRoom[] = [];
    availableSheets: Sheet[];
    private readonly room = PRIVATE_ROOM_ID;
    constructor(readonly logger: Logger, readonly sheetService: SheetService, public gameService: GameLogicService) {
        this.sheetService.getAllSheets().then((sheets) => {
            this.availableSheets = sheets;
        });
    }

    @SubscribeMessage(GameEvents.CreateLimitedTimeSolo)
    async createLimitedSoloGame(client: Socket, payload) {
        const room = await this.createRoom(client, payload);
        console.log(room);
        const left = this.createImageBuffer(room.currentSheet.originalImagePath);
        const right = this.createImageBuffer(room.currentSheet.modifiedImagePath);
        this.server.to(room.roomName).emit(GameEvents.LimitedTimeRoomCreated, { room, left, right });
    }
    @SubscribeMessage(GameEvents.CreateLimitedTimeCoop)
    async createLimitedCoopGame(client: Socket, payload) {
        const room = this.findRoom();
        if (room) {
            this.joinAndConfirmCoopGame(client, payload);
            return;
        }
        await this.createRoom(client, payload);
    }
    @SubscribeMessage(GameEvents.JoinCoop)
    async joinAndConfirmCoopGame(client: Socket, payload) {
        const room = this.rooms.find((iter) => iter.player1 === undefined || iter.player2 === undefined);
        client.join(room.roomName);
        room.player2 = payload.player;
        const left = this.createImageBuffer(room.currentSheet.originalImagePath);
        const right = this.createImageBuffer(room.currentSheet.modifiedImagePath);
        this.server.to(room.roomName).emit(GameEvents.SecondPlayerJoined, { room, left, right });
    }

    @SubscribeMessage(GameEvents.playerReady)
    @SubscribeMessage(GameEvents.Click)
    async handleClick(client: Socket, payload) {
        console.log('clicked');
        const click: Coord = { posX: payload.x, posY: payload.y };
        const room: LimitedTimeRoom = this.rooms.find((iter) => iter.roomName === payload.roomName);
        const player = room.player1?.socketId === client.id ? room.player1 : room.player2;
        let diffFound: Coord[] = null;
        let left = null;
        let right = null;
        for (const diff of room.currentDifferences) {
            if (diff.coords.find((coord) => JSON.stringify(coord) === JSON.stringify(click))) {
                diff.found = true;
                player.differencesFound++;
                diffFound = diff.coords;
                await this.rerollSheet(room);
                left = this.createImageBuffer(room.currentSheet.originalImagePath);
                right = this.createImageBuffer(room.currentSheet.modifiedImagePath);
                break;
            }
        }
        this.server.to(room.roomName).emit(GameEvents.ClickValidated, { diffFound, room, player, left, right });
    }

    handleConnection(socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
    }

    handleDisconnect(socket: Socket) {
        this.logger.log(`Client disconnected: ${socket.id}`);
        let player: Player;
        let foundRoom: LimitedTimeRoom;
        for (const room of this.rooms) {
            if (room.player1?.socketId === socket.id || room.player2?.socketId === socket.id) {
                foundRoom = room;
                if (room.player1.socketId === socket.id) {
                    player = room.player1;
                    room.player1 = undefined;
                } else {
                    player = room.player2;
                    room.player2 = undefined;
                }
                break;
            }
        }
        if (!foundRoom) {
            return;
        }
        this.server.to(foundRoom.roomName).emit('playerLeft', player);

        socket.leave(foundRoom.roomName);
        if (foundRoom.player1 === undefined && foundRoom.player2 === undefined) {
            this.rooms = this.removeRoom(foundRoom);
        } //
    }
    afterInit() {
        setInterval(() => {
            this.emitTime();
        }, DELAY_BEFORE_EMITTING_TIME);
    }
    private emitTime() {
        this.server.emit(ChatEvents.Clock, new Date());
    }
    private getRandomSheet(): Sheet {
        const randomIdx = Math.floor(Math.random() * this.availableSheets.length);
        return this.availableSheets[randomIdx];
    }

    private removeRoom(room: LimitedTimeRoom) {
        return this.rooms.filter((iter) => iter.roomName !== room.roomName);
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
    private async createRoom(client: Socket, payload) {
        const sheet = this.getRandomSheet();
        console.log(sheet);
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
    private async rerollSheet(room: LimitedTimeRoom) {
        let randomSheet = this.getRandomSheet();
        while (room.usedSheets.includes(randomSheet._id)) {
            randomSheet = this.getRandomSheet();
        }
        const newDiffs = await this.gameService.getAllDifferences(randomSheet);
        room.currentDifferences = newDiffs;
        room.currentSheet = randomSheet;
        room.usedSheets.push(randomSheet._id);
    }

    private findRoom() {
        return this.rooms.find((iter) => iter.player1 === undefined || iter.player2 === undefined);
    }
}
