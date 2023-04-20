/* eslint-disable max-params */
import { ChatEvents } from '@app/gateways/chat/chat.gateway.events';
import { Sheet } from '@app/model/database/sheet';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { GameLogicService } from '@app/services/game-logic/game-logic.service';
import { GatewayLogicService } from '@app/services/gateway-logic/gateway-logic.service';
import { SheetService } from '@app/services/sheet/sheet.service';
import { ChatMessage } from '@common/chat-message';
import { Coord } from '@common/coord';
import { GameEvents } from '@common/game-events';
import { LIMITED_TIME_COOP, LIMITED_TIME_SOLO } from '@common/game-types';
import { LimitedTimeRoom } from '@common/limited-time-room';
import { Player } from '@common/player';
import { Injectable } from '@nestjs/common';
import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class GameGateway implements OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    rooms: LimitedTimeRoom[] = [];
    availableSheets: Sheet[];
    constructor(
        readonly sheetService: SheetService,
        public gameService: GameLogicService,
        public gameHistoryService: GameHistoryService,
        public gatewayLogicService: GatewayLogicService,
    ) {
        this.gatewayLogicService.getAllSheets().then((sheets) => {
            this.availableSheets = sheets;
        });
    }

    @SubscribeMessage(GameEvents.CreateLimitedTimeSolo)
    async createLimitedSoloGame(client: Socket, payload) {
        payload.player.socketId = client.id;
        const room = await this.gatewayLogicService.createRoom(client, payload, LIMITED_TIME_SOLO, this.rooms, this.availableSheets);
        room.hasStarted = true;
        const left = this.gatewayLogicService.createImageBuffer(room.currentSheet.originalImagePath);
        const right = this.gatewayLogicService.createImageBuffer(room.currentSheet.modifiedImagePath);
        this.server.to(room.roomName).emit(GameEvents.LimitedTimeRoomCreated, { room, left, right });
    }
    @SubscribeMessage(GameEvents.CreateLimitedTimeCoop)
    async createLimitedCoopGame(client: Socket, payload) {
        payload.player.socketId = client.id;
        const room = this.gatewayLogicService.findRoomToJoin(this.rooms);
        if (room) {
            this.joinAndConfirmCoopGame(client, payload);
            return;
        }
        await this.gatewayLogicService.createRoom(client, payload, LIMITED_TIME_COOP, this.rooms, this.availableSheets);
    }
    @SubscribeMessage(GameEvents.JoinCoop)
    async joinAndConfirmCoopGame(client: Socket, payload) {
        const room = this.gatewayLogicService.findRoomToJoin(this.rooms);
        room.hasStarted = true;
        client.join(room.roomName);
        room.player2 = payload.player;
        room.player2.socketId = client.id;
        room.playersInRoom = 2;
        const left = this.gatewayLogicService.createImageBuffer(room.currentSheet.originalImagePath);
        const right = this.gatewayLogicService.createImageBuffer(room.currentSheet.modifiedImagePath);

        this.server.to(room.roomName).emit(GameEvents.SecondPlayerJoined, { room, left, right });
    }

    @SubscribeMessage(GameEvents.SheetDeleted)
    removeSheet(socket: Socket, payload) {
        this.availableSheets = this.availableSheets.filter((sheet) => JSON.stringify(sheet._id) !== JSON.stringify(payload._id));
    }
    @SubscribeMessage(GameEvents.CancelGame)
    cancelGame(socket: Socket) {
        const room = this.rooms.find((iter) => iter.player1.socketId === socket.id);
        this.removeRoom(room);
    }

    @SubscribeMessage(GameEvents.SheetCreated)
    async updateSheets() {
        const DELAY = 500;
        setTimeout(() => {
            this.sheetService.getAllSheets().then((sheets) => {
                this.availableSheets = sheets;
            });
        }, DELAY);
    }

    @SubscribeMessage(GameEvents.TimeOut)
    handleTimeOut(client: Socket, payload) {
        const room: LimitedTimeRoom = this.rooms.find((iter) => iter.roomName === payload.roomName);
        const message = 'Time Out⏲️! Bien essayé!👍';
        client.emit(GameEvents.GameOver, message);
        if (room.isGameDone) return;
        this.gatewayLogicService.createHistoryForGameExpired(room, payload.player, payload.allyGaveUp).then(() => {
            room.isGameDone = true;
        });
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
                const message: ChatMessage = { content: ' A trouvé une différence!', name: player.name, type: 'game' };
                this.server.to(room.roomName).emit(ChatEvents.RoomMessage, message);
                diff.found = true;
                player.differencesFound++;
                diffFound = diff.coords;
                await this.gatewayLogicService.rerollSheet(room, this.availableSheets, player);
                if (room.isGameDone) {
                    const messageDiff = "Fin de la partie! Vous n'avez laissé aucune fiche!🙌";
                    this.server.to(room.roomName).emit(GameEvents.GameOver, messageDiff);
                    break;
                }
                left = this.gatewayLogicService.createImageBuffer(room.currentSheet.originalImagePath);
                right = this.gatewayLogicService.createImageBuffer(room.currentSheet.modifiedImagePath);
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

    @SubscribeMessage(ChatEvents.Hint)
    hintActivated(client: Socket) {
        const room = this.rooms.find((res) => res.player1?.socketId === client.id);
        if (!room) return;
        room.player1.usedHints++;
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour12: false });
        const hintUsed: ChatMessage = { content: `${timeString} - Indice utilisé`, type: 'game' };
        client.emit(ChatEvents.RoomMessage, hintUsed);
    }

    async handleDisconnect(socket: Socket) {
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
        const message: ChatMessage = { content: 'Ton allié a quitté la partie😱, basculé en mode Solo!', type: 'game' };
        this.server.to(foundRoom.roomName).emit(ChatEvents.RoomMessage, message);
        if (!foundRoom.playersInRoom && !foundRoom.isGameDone) {
            await this.gatewayLogicService.createHistoryForDesertedRoom(foundRoom);
            this.removeRoom(foundRoom);
        } else if (foundRoom.isGameDone) {
            this.removeRoom(foundRoom);
        }
    }
    private removeRoom(room: LimitedTimeRoom) {
        this.rooms = this.rooms.filter((iter) => iter.roomName !== room.roomName);
    }
}
