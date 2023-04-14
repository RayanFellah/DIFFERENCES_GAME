import { ID_LENGTH, MULTIPLAYER_MODE, SOLO_MODE } from '@app/constants';
import { Coord } from '@app/interfaces/coord';
import { Sheet } from '@app/model/database/sheet';
import { HistoryInterface } from '@app/model/schema/history.schema';
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
    private readonly room = PRIVATE_ROOM_ID;

    constructor(
        readonly logger: Logger,
        readonly sheetService: SheetService,
        public gameService: GameLogicService,
        public gameHistoryService: GameHistoryService,
    ) {}

    @SubscribeMessage('createSoloGame')
    async createSoloRoom(socket: Socket, payload: { name: string; sheetId: string; roomName: string }) {
        const playSheet = await this.sheetService.getSheet(payload.sheetId);
        const diffs = await this.gameService.getAllDifferences(playSheet);
        const player = { name: payload.name, socketId: socket.id, differencesFound: 0 };
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
        this.server.to(newRoom.roomName).emit(ChatEvents.JoinedRoom, newRoom);
        this.sendRoomInfo(newRoom);
    }

    @SubscribeMessage('click')
    validateClick(client: Socket, payload) {
        const clickCoord: Coord = { posX: payload.x, posY: payload.y };
        const room = this.rooms.find((res) => res.roomName === payload.roomName);
        const player: Player = room.player1.name === payload.playerName ? room.player1 : room.player2;
        let isError = true;
        for (const diff of room.differences) {
            for (const coords of diff.coords) {
                if (JSON.stringify(clickCoord) === JSON.stringify(coords)) {
                    isError = false;
                    this.server.to(payload.roomName).emit('roomMessage', { content: `${player.name} a trouvé une différence!`, type: 'game' });
                    player.differencesFound++;
                    this.server.to(payload.roomName).emit('clickFeedBack', {
                        coords: diff.coords,
                        player,
                        diffsLeft: room.numberOfDifferences - player.differencesFound,
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
            });
            const errorMessage: ChatMessage = { content: `ERROR FROM ${player.name}`, type: 'game', time: '' };
            this.server.to(payload.roomName).emit(ChatEvents.RoomMessage, errorMessage);
        }
        if (
            (player.differencesFound === room.numberOfDifferences && room.gameType === SOLO_MODE) ||
            (player.differencesFound >= (room.numberOfDifferences + ((room.numberOfDifferences + 1) % 2)) / 2 && room.gameType === MULTIPLAYER_MODE)
        ) {
            this.server.to(payload.roomName).emit('gameDone', player.name);
            const timeInSeconds = Math.floor((new Date().getTime() - room.startTime.getTime()) / 1000);
            this.checkTopScores(room, timeInSeconds, player.name);
            room.isGameDone = true;
            const history = {
                gameStart: room.startTime.toTimeString(),
                duration: this.elapsedTime(room.startTime),
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
        const message: ChatMessage = {
            content: payload.message.content,
            type: 'opponent',
            time: '',
        };
        if (payload.message.content.length > 0) {
            socket.broadcast.to(payload.roomName).emit('roomMessage', message);
        }
    }
    @SubscribeMessage(ChatEvents.Hint)
    hintActivated() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour12: false });
        const hintUsed: ChatMessage = { content: `${timeString} - Indice utilisé`, type: 'game', time: '' };
        this.server.emit(ChatEvents.RoomMessage, hintUsed);
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
            player1: { name: player1, socketId: socket.id, differencesFound: 0 },
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
        room.player2 = { name: player2, socketId: socket.id, differencesFound: 0 };
        socket.join(room.roomName);
        this.server.to(room.roomName).emit(ChatEvents.JoinedRoom, room);
        this.sendRoomInfo(room);
        const wait = this.waitingRooms.find((iter) => JSON.stringify(iter.sheetId) === JSON.stringify(room.sheet._id));
        socket.rooms.delete(`GameRoom${wait.sheetId}`);
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
                        this.logger.error(`Failed to delete original image for sheet with id ${sheetId}: ${error}`);
                    }
                }
                sheet.originalImagePath = null;
                // Delete the modified image
                if (sheet.modifiedImagePath) {
                    const modifiedImageFilePath = `./uploads/${sheet.modifiedImagePath}`;
                    try {
                        unlinkSync(modifiedImageFilePath);
                    } catch (error) {
                        this.logger.error(`Failed to delete modified image for sheet with id ${sheetId}: ${error}`);
                    }
                }
                sheet.modifiedImagePath = null;
                this.sheetService.deleteSheet(sheetId);
                this.server.to(`GameRoom${sheetId}`).emit('CurrentGameDeleted', sheetId);
                this.server.to('GridRoom').emit('sheetDeleted', sheetId);
            } catch (error) {
                this.logger.error(`Failed to delete sheet with id ${sheetId}: ${error}`);
            }
        });
    }

    @SubscribeMessage('reset_history')
    async resetHistory() {
        try {
            await this.gameHistoryService.deleteAllHistory();
        } catch (error) {
            this.logger.error(`Failed to reset history: ${error}`);
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

    // @SubscribeMessage('updateScores')
    // updateScores(socket: Socket, payload) {
    //     if (payload.mode === SOLO_MODE) this.sheetService.modifySheet({ _id: payload.sheetId, top3Solo: payload.scores });
    //     if (payload.mode === MULTIPLAYER_MODE) this.sheetService.modifySheet({ _id: payload.sheetId, top3Multi: payload.scores });
    //     const globalMessage: ChatMessage = {
    //         content: `le joueur ${payload.name} a pris la position ${in} au jeu en Mode ${payload.mode}`,
    //         type: 'global',
    //         time: '',
    //     };
    //     this.server.emit(ChatEvents.RoomMessage, globalMessage);
    // }
    @SubscribeMessage('delete_all_sheets')
    async deleteAllSheets() {
        try {
            await this.sheetService.deleteAllSheets();
            this.server.to('GridRoom').emit('sheetDeleted', 'all');
        } catch (error) {
            this.logger.error(error);
        }
    }
    sendSheetCreated(sheet: Sheet) {
        this.server.to('GridRoom').emit('sheetCreated', sheet);
    }
    afterInit() {
        setInterval(() => {
            this.emitTime();
        }, DELAY_BEFORE_EMITTING_TIME);
    }

    handleConnection(socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
    }

    handleDisconnect(socket: Socket) {
        if (!socket) return;
        this.logger.log(`Client disconnected: ${socket.id}`);
        const room = this.rooms.find((iterRoom) => iterRoom.player1?.socketId === socket.id || iterRoom.player2?.socketId === socket.id);
        if (!room) return;
        socket.leave(room.roomName);
        if (!room.isGameDone) {
            if (room.gameType === 'solo') {
                const history: HistoryInterface = {
                    gameStart: room.startTime.toLocaleTimeString(),
                    duration: this.elapsedTime(room.startTime),
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
                    gameStart: room.startTime.toLocaleTimeString(),
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
        console.log('hello');
        let scores = room.gameType === 'solo' ? room.sheet.top3Solo : room.sheet.top3Multi;
        console.log(scores);
        console.log(time);
        const index: number = scores.findIndex((score) => score.time > time);
        const notFound = -1;
        if (index !== notFound) {
            console.log(index);
            scores.splice(index, 0, { playerName: name, time });
            scores = scores.slice(0, 3);
            if (room.gameType === SOLO_MODE) this.sheetService.modifySheet({ _id: room.sheet._id, top3Solo: scores });
            if (room.gameType === MULTIPLAYER_MODE) this.sheetService.modifySheet({ _id: room.sheet._id, top3Multi: scores });
            const globalMessage: ChatMessage = {
                content: `le joueur ${name} a pris la position ${index + 1} au jeu ${room.sheet.title} en Mode ${room.gameType}`,
                type: 'global',
                time: '',
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
    private elapsedTime(startTime: Date): string {
        const MILLISECONDS = 1000;
        const MINUTES = 60;
        const elapsedTimeInSeconds = Math.floor((new Date().getTime() - startTime.getTime()) / MILLISECONDS);
        const minutes = Math.floor(elapsedTimeInSeconds / MINUTES);
        const seconds = elapsedTimeInSeconds % MINUTES;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}
