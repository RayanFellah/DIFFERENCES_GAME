/* eslint-disable max-lines */
import { ID_LENGTH, MULTIPLAYER_MODE, SOLO_MODE } from '@app/constants';
import { Coord } from '@app/interfaces/coord';
import { Sheet } from '@app/model/database/sheet';
import { HistoryInterface } from '@app/model/schema/history.schema';
import { GameConstantsService } from '@app/services/game-constants/game-constants.service';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { GameLogicService } from '@app/services/game-logic/game-logic.service';
import { SheetService } from '@app/services/sheet/sheet.service';
import { ChatMessage } from '@common/chat-message';
import { PlayRoom } from '@common/play-room';
import { Player } from '@common/player';
import { scores } from '@common/score';
import { WaitingRoom } from '@common/waiting-room';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { unlinkSync } from 'fs';
import { Server, Socket } from 'socket.io';
import { DELAY_BEFORE_EMITTING_TIME, PRIVATE_ROOM_ID } from './chat.gateway.constants';
import { ChatEvents } from './chat.gateway.events';
@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() server: Server;

    rooms: PlayRoom[] = [];
    waitingRooms: WaitingRoom[] = [];
    private readonly gameConstantsService: GameConstantsService;
    private readonly room = PRIVATE_ROOM_ID;

    constructor(readonly sheetService: SheetService, public gameService: GameLogicService, public gameHistoryService: GameHistoryService) {
        this.gameConstantsService = new GameConstantsService();
    }

    @SubscribeMessage('createSoloGame')
    async createSoloRoom(socket: Socket, payload: { name: string; sheetId: string; roomName: string }) {
        const playSheet = await this.sheetService.getSheet(payload.sheetId);
        const diffs = await this.gameService.getAllDifferences(playSheet);
        const player: Player = { name: payload.name, socketId: socket.id, differencesFound: 0, usedHints: 0 };
        const newRoom: PlayRoom = {
            roomName: payload.roomName,
            player1: player,
            player2: undefined,
            startTime: new Date(),
            sheet: playSheet,
            differences: diffs,
            numberOfDifferences: diffs.length,
            gameType: SOLO_MODE,
            isGameDone: false,
        };
        this.rooms.push(newRoom);
        socket.join(newRoom.roomName);
        this.sendRoomInfo(newRoom);
    }

    @SubscribeMessage('click')
    validateClick(client: Socket, payload) {
        const clickCoord: Coord = { posX: payload.click.x, posY: payload.click.y };
        const room = this.rooms.find((res) => res.roomName === payload.roomName);
        const player: Player = room.player1.name === payload.playerName ? room.player1 : room.player2;
        let isError = true;
        for (const diff of room.differences) {
            for (const coords of diff.coords) {
                if (JSON.stringify(clickCoord) === JSON.stringify(coords)) {
                    isError = false;
                    this.server.to(payload.roomName).emit('roomMessage', { name: player.name, content: 'Trouvé une différence!', type: 'game' });
                    player.differencesFound++;
                    this.server.to(payload.roomName).emit('clickFeedBack', {
                        coords: diff.coords,
                        player,
                        diffsLeft: room.numberOfDifferences - player.differencesFound,
                        click: payload.click,
                    });
                    this.server.to(payload.roomName).emit('foundDiff', player);
                    room.differences = room.differences.filter((it) => JSON.stringify(diff) !== JSON.stringify(it));
                }
            }
        }
        if (isError) {
            this.server.to(payload.roomName).emit('clickFeedBack', {
                coords: undefined,
                player,
                diffsLeft: room.differences.length - player.differencesFound,
                click: payload.click,
            });
            const errorMessage: ChatMessage = { name: player.name, content: `ERROR FROM ${player.name}`, type: 'error' };
            this.server.to(payload.roomName).emit(ChatEvents.RoomMessage, errorMessage);
        }
        if (
            (player.differencesFound === room.numberOfDifferences && room.gameType === SOLO_MODE) ||
            (player.differencesFound >= (room.numberOfDifferences + (room.numberOfDifferences % 2)) / 2 && room.gameType === MULTIPLAYER_MODE)
        ) {
            room.isGameDone = true;
            this.server.to(payload.roomName).emit('gameDone', player.name);

            const penalty = this.calculateTimePenalty(player);

            const timeInSeconds = Math.floor((new Date().getTime() - room.startTime.getTime()) / DELAY_BEFORE_EMITTING_TIME);
            this.checkTopScores(room, timeInSeconds + penalty, player.name);
            const history = {
                gameStart: this.getFullDate(room.startTime),
                duration: this.elapsedTime(room.startTime, timeInSeconds),
                gameMode: room.gameType === 'solo' ? 'ClassicSolo' : 'ClassicMultiplayer',
                player1: player.name,
                winner1: true,
                gaveUp1: false,
                player2: room.player2 ? room.player2.name : undefined,
                winner2: false,
                gaveUp2: false,
            };

            this.gameHistoryService.addHistory(history);

            return;
        }
    }
    @SubscribeMessage(ChatEvents.RoomMessage)
    roomMessage(socket: Socket, payload) {
        const message = payload.message;
        message.type = 'opponent';
        if (payload.message.content.length > 0) {
            socket.broadcast.to(payload.roomName).emit('roomMessage', message);
        }
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

    @SubscribeMessage(ChatEvents.JoinGridRoom)
    joinGridRoom(socket: Socket) {
        socket.join('GridRoom');
    }
    @SubscribeMessage('gameJoinable')
    joinableGame(socket: Socket, { playerName, sheetId }: { playerName: string; sheetId: string }) {
        this.sheetService.modifySheet({ _id: sheetId, isJoinable: true });
        socket.join(`GameRoom${sheetId}`);
        this.waitingRooms.push({ sheetId, players: [playerName] });
        socket.broadcast.to('GridRoom').emit('Joinable', sheetId);
    }

    @SubscribeMessage('cancelGameCreation')
    cancelGameCreation(socket: Socket, sheetId: string) {
        this.sheetService.modifySheet({ _id: sheetId, isJoinable: false });
        socket.broadcast.to('GridRoom').emit('Cancelled', sheetId);
    }

    @SubscribeMessage('joinGame')
    joinGame(socket: Socket, { playerName, sheetId }: { playerName: string; sheetId: string }) {
        const waitingRoom = this.waitingRooms.find((room) => room.sheetId === sheetId);
        if (waitingRoom) {
            if (waitingRoom.players.includes(playerName)) {
                socket.emit('AlreadyJoined');
                return;
            }
        }
        socket.join(`GameRoom${sheetId}`);
        waitingRoom.players.push(playerName);
        socket.broadcast.to(`GameRoom${sheetId}`).emit('UserJoined', { playerName, sheetId });
    }
    @SubscribeMessage('cancelJoinGame')
    cancelJoinGame(socket: Socket, { playerName, sheetId }: { playerName: string; sheetId: string }) {
        socket.broadcast.to(`GameRoom${sheetId}`).emit('UserCancelled', { playerName });
        socket.leave(`GameRoom${sheetId}`);
    }
    @SubscribeMessage('playerRejected')
    playerRejected(socket: Socket, { playerName, sheetId }: { playerName: string; sheetId: string }) {
        const waitingRoom = this.waitingRooms.find((room) => room.sheetId === sheetId);

        if (waitingRoom) waitingRoom.players = waitingRoom.players.filter((player) => player !== playerName);
        socket.broadcast.to(`GameRoom${sheetId}`).emit('Rejection', { playerName, sheetId });
    }
    @SubscribeMessage('quitRoom')
    quitRoom(socket: Socket, sheetId: string) {
        socket.leave(`GameRoom${sheetId}`);
    }
    @SubscribeMessage('playerConfirmed')
    async playerConfirmed(socket: Socket, { player1, player2, sheetId }: { player1: string; player2: string; sheetId: string }) {
        const playSheet = await this.sheetService.getSheet(sheetId);
        if (!playSheet) {
            throw new NotFoundException('Sheet not found');
        }
        const diffs = await this.gameService.getAllDifferences(playSheet);
        const newRoom: PlayRoom = {
            roomName: this.generateRandomId(ID_LENGTH),
            player1: { name: player1, socketId: socket.id, differencesFound: 0, usedHints: 0 },
            player2: undefined,
            sheet: playSheet,
            startTime: new Date(),
            differences: diffs,
            numberOfDifferences: diffs.length,
            gameType: MULTIPLAYER_MODE,
            isGameDone: false,
        };
        this.rooms.push(newRoom);
        socket.join(newRoom.roomName);
        socket.broadcast.to(`GameRoom${sheetId}`).emit('MultiRoomCreated', { player2, roomName: newRoom.roomName });
        this.server.to(newRoom.roomName).emit(ChatEvents.RoomCreated, newRoom.roomName);
        const waitingRoom = this.waitingRooms.find((room) => room.sheetId === sheetId);
        if (waitingRoom) waitingRoom.players = waitingRoom.players.filter((player) => player !== player2);
    }
    @SubscribeMessage('player2Joined')
    player2Joined(socket: Socket, { player2, roomName }: { player2: string; roomName: string }) {
        const room = this.rooms.find((res) => res.roomName === roomName);
        room.player2 = { name: player2, socketId: socket.id, differencesFound: 0, usedHints: 0 };
        socket.join(room.roomName);
        this.server.to(room.roomName).emit(ChatEvents.JoinedRoom, room);
        this.sendRoomInfo(room);
        const wait = this.waitingRooms.find((iter) => JSON.stringify(iter.sheetId) === JSON.stringify(room.sheet._id));
        socket.leave(`GameRoom${room.sheet._id}`);
        this.waitingRooms = this.waitingRooms.filter((iter) => iter.sheetId !== wait.sheetId);
    }

    @SubscribeMessage('rejectionConfirmed')
    async rejectionConfirmed(socket: Socket, sheetId: string) {
        await socket.leave(`GameRoom${sheetId}`);
    }
    @SubscribeMessage('deleteSheet')
    deleteSheet(socket: Socket, { sheetId }: { sheetId: string }) {
        this.sheetService.getSheet(sheetId).then((sheet) => {
            try {
                if (sheet.originalImagePath) {
                    const originalImageFilePath = `./uploads/${sheet.originalImagePath}`;
                    try {
                        unlinkSync(originalImageFilePath);
                    } catch (error) {
                        Logger.error(`Failed to delete original image for sheet with id ${sheetId}: ${error}`);
                    }
                }
                sheet.originalImagePath = null;
                // Delete the modified image
                if (sheet.modifiedImagePath) {
                    const modifiedImageFilePath = `./uploads/${sheet.modifiedImagePath}`;
                    try {
                        unlinkSync(modifiedImageFilePath);
                    } catch (error) {
                        Logger.error(`Failed to delete modified image for sheet with id ${sheetId}: ${error}`);
                    }
                }
                sheet.modifiedImagePath = null;
                this.sheetService.deleteSheet(sheetId);
                this.server.to(`GameRoom${sheetId}`).emit('CurrentGameDeleted', sheetId);
                this.server.emit('sheetDeleted', sheetId);
                for (const room of this.rooms) {
                    if (room.sheet._id.toString() === sheetId) {
                        this.server.to(room.roomName).emit('kickOut');
                    }
                }
                this.rooms.filter((room) => room.sheet._id !== sheetId);
            } catch (error) {
                Logger.error(`Failed to delete sheet with id ${sheetId}: ${error}`);
            }
        });
    }

    @SubscribeMessage('reset_history')
    async resetHistory() {
        try {
            await this.gameHistoryService.deleteAllHistory();
        } catch (error) {
            Logger.error(`Failed to reset history: ${error}`);
        }
    }

    // getting history for client
    @SubscribeMessage('get_all_History')
    getAllHistory(client: Socket) {
        this.gameHistoryService.getHistory().then((history) => {
            client.emit('all_history_received', history);
        });
    }
    @SubscribeMessage('reset_all_scores')
    async resetAllScores() {
        const sheets = await this.sheetService.getAllSheets();
        for (const sheet of sheets) {
            this.resetScores(sheet._id);
        }
        this.server.emit('reinitialized');
    }

    // send history to server for adding
    @SubscribeMessage('new_history')
    async sendHistoryToServer(history: HistoryInterface, payload) {
        history = payload;
        this.gameHistoryService.addHistory(history);
        this.server.emit('history_recieved', history);
    }
    @SubscribeMessage('reinitialize')
    reinitialize(socket: Socket, payload) {
        this.resetScores(payload.id);
        this.server.emit('reinitialized', payload);
    }
    @SubscribeMessage('delete_all_sheets')
    async deleteAllSheets() {
        try {
            await this.sheetService.deleteAllSheets();
            this.server.to('GridRoom').emit('sheetDeleted', 'all');
            for (const room of this.rooms) {
                this.server.to(room.roomName).emit('kickOut');
            }
        } catch (error) {
            Logger.error(error);
        }
    }
    @SubscribeMessage('updateConstants')
    async updateConstants(socket: Socket, payload) {
        this.gameConstantsService.readGameConstantsFile();
        this.gameConstantsService.updateGameConstantsFile(payload);
        this.server.emit('gameConstants', payload);
    }
    @SubscribeMessage('getConstants')
    async getConstants(socket: Socket) {
        const constants = this.gameConstantsService.readGameConstantsFile();
        socket.emit('gameConstants', constants);
    }
    sendSheetCreated(sheet: Sheet) {
        this.server.to('GridRoom').emit('sheetCreated', sheet);
    }
    afterInit() {
        setInterval(() => {
            this.emitTime();
        }, DELAY_BEFORE_EMITTING_TIME);
    }
    calculateTimePenalty(player: Player) {
        const penalty = this.gameConstantsService.readGameConstantsFile().gamePenalty as number;
        return player.usedHints * penalty;
    }

    handleConnection(socket: Socket) {
        Logger.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
    }

    handleDisconnect(socket: Socket) {
        if (!socket) return;
        Logger.log(`Client disconnected: ${socket.id}`);
        const room = this.rooms.find((iterRoom) => iterRoom.player1?.socketId === socket.id || iterRoom.player2?.socketId === socket.id);
        if (!room) return;
        socket.leave(room.roomName);
        if (!room.isGameDone) {
            if (room.gameType === 'solo') {
                const penalty = this.calculateTimePenalty(room.player1);
                const history: HistoryInterface = {
                    gameStart: this.getFullDate(room.startTime),
                    duration: this.elapsedTime(room.startTime, penalty),
                    gameMode: 'solo',
                    player1: room.player1.name,
                    winner1: false,
                    gaveUp1: true,
                };
                this.gameHistoryService.addHistory(history);
                this.deleteRoom(room);
            } else {
                room.isGameDone = true;
                const history: HistoryInterface = {
                    gameStart: this.getFullDate(room.startTime),
                    duration: this.elapsedTime(room.startTime),
                    gameMode: 'multi',
                    player1: room.player1.name,
                    player2: room.player2.name,
                    winner1: room.player2.socketId === socket.id,
                    winner2: room.player1.socketId === socket.id,
                    gaveUp1: room.player1.socketId === socket.id,
                    gaveUp2: room.player2.socketId === socket.id,
                };
                this.gameHistoryService.addHistory(history);
                this.server.to(room.roomName).emit('playerLeft');
            }
        } else this.deleteRoom(room);
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
    private emitTime() {
        this.server.emit(ChatEvents.Clock, new Date());
    }
    private checkTopScores(room: PlayRoom, time: number, name: string): void {
        let roomScores = room.gameType === 'solo' ? room.sheet.top3Solo : room.sheet.top3Multi;
        const index: number = roomScores.findIndex((score) => score.time > time);
        const notFound = -1;
        if (index !== notFound) {
            roomScores.splice(index, 0, { playerName: name, time });
            roomScores = roomScores.slice(0, 3);
            if (room.gameType === SOLO_MODE) this.sheetService.modifySheet({ _id: room.sheet._id, top3Solo: roomScores });
            if (room.gameType === MULTIPLAYER_MODE) this.sheetService.modifySheet({ _id: room.sheet._id, top3Multi: roomScores });
            const globalMessage: ChatMessage = {
                content: `le joueur ${name.toUpperCase()} a pris la position ${
                    index === 0 ? '1🥇' : index === 1 ? '2🥈' : index === 2 ? '3🥉' : ''
                } au jeu "${room.sheet.title}" en Mode ${room.gameType === 'solo' ? 'Solo' : 'MultiJoueur'}`,
                type: 'global',
            };
            this.server.emit(ChatEvents.RoomMessage, globalMessage);
        }
    }
    private deleteRoom(room: PlayRoom) {
        this.rooms = this.rooms.filter((res) => res.roomName !== room.roomName);
    }
    private sendRoomInfo(room: PlayRoom) {
        this.server.to(room.roomName).emit('roomInfo', room);
    }
    private async resetScores(sheetId: string) {
        const sheet = await this.sheetService.getSheet(sheetId);
        const index = sheet.title.charCodeAt(0) % scores.length;
        this.sheetService.modifySheet({ _id: sheetId, top3Solo: scores[index], top3Multi: scores[(index * 3) % scores.length] });
    }
    private elapsedTime(startTime: Date, timePenalty: number = 0 || null): string {
        const MILLISECONDS = 1000;
        const MINUTES = 60;
        const elapsedTimeInSeconds = Math.floor((new Date().getTime() - startTime.getTime()) / MILLISECONDS) + timePenalty;
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
