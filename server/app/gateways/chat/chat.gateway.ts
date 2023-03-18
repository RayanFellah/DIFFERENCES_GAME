import { ID_LENGTH, MULTIPLAYER_MODE, SOLO_MODE } from '@app/constants';
import { Coord } from '@app/interfaces/coord';
import { GameLogicService } from '@app/services/game-logic/game-logic.service';
import { SheetService } from '@app/services/sheet/sheet.service';
import { ChatMessage } from '@common/chat-message';
import { PlayRoom } from '@common/play-room';
import { Player } from '@common/player';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { unlinkSync } from 'fs';
import { Server, Socket } from 'socket.io';
import { DELAY_BEFORE_EMITTING_TIME, PRIVATE_ROOM_ID } from './chat.gateway.constants';
import { ChatEvents } from './chat.gateway.events';
@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() server: Server;

    sentToSockets = new Set<string>();
    rooms: PlayRoom[] = [];
    private readonly room = PRIVATE_ROOM_ID;

    constructor(private readonly logger: Logger, private readonly sheetService: SheetService, private gameService: GameLogicService) {}

    @SubscribeMessage('createSoloGame')
    async createSoloRoom(socket: Socket, payload: { name: string; sheetId: string; roomName: string }) {
        const playSheet = await this.sheetService.getSheet(payload.sheetId);
        const diffs = await this.gameService.getAllDifferences(playSheet);
        const newRoom: PlayRoom = {
            roomName: payload.roomName,
            player1: { name: payload.name, socketId: socket.id, differencesFound: 0 },
            player2: undefined,
            sheet: playSheet,
            differences: diffs,
            numberOfDifferences: diffs.length,
            gameType: SOLO_MODE,
            isGameDone: false,
        };
        this.rooms.push(newRoom);
        socket.join(newRoom.roomName);
        this.server.to(newRoom.roomName).emit(ChatEvents.RoomCreated, newRoom.roomName);
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
                    this.server
                        .to(payload.roomName)
                        .emit('roomMessage', { sender: '', content: `${payload.playerName} avez trouvé une différence!`, type: 'game' });
                    player.differencesFound++;
                    this.server.to(payload.roomName).emit('clickFeedBack', {
                        coords: diff.coords,
                        player,
                        diffsLeft: room.differences.length - player.differencesFound,
                    });
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
        }
        if (
            (player.differencesFound === room.numberOfDifferences && room.gameType === SOLO_MODE) ||
            (player.differencesFound >= room.numberOfDifferences / 2 && room.gameType === MULTIPLAYER_MODE)
        ) {
            this.server.to(payload.roomName).emit('gameDone', `${payload.playerName} has won!`);
            room.isGameDone = true;
            return;
        }
    }
    @SubscribeMessage('gameDone')
    finishGame(socket: Socket, roomName: string) {
        const room = this.rooms.find((iterRoom) => iterRoom.roomName === roomName);
        const player = room.player1.socketId === socket.id ? room.player1 : room.player2;
        const message: ChatMessage = {
            content: `${player.name} won !`,
            type: 'game',
        };
        this.server.to(room.roomName).emit('gameFinished', message);
    }

    @SubscribeMessage(ChatEvents.RoomMessage)
    roomMessage(socket: Socket, payload) {
        const message: ChatMessage = {
            content: payload.message.content,
            type: '',
        };
        if (payload.message.content.length > 0) {
            socket.broadcast.to(payload.roomName).emit('roomMessage', message);
        }
    }

    @SubscribeMessage(ChatEvents.JoinGridRoom)
    joinGridRoom(socket: Socket) {
        socket.join('GridRoom');
    }
    @SubscribeMessage('gameJoinable')
    joinableGame(socket: Socket, sheetId: string) {
        this.sheetService.modifySheet({ _id: sheetId, isJoinable: true });
        socket.join(`GameRoom${sheetId}`);
        socket.broadcast.to('GridRoom').emit('Joinable', sheetId);
    }

    @SubscribeMessage('cancelGameCreation')
    cancelGameCreation(socket: Socket, sheetId: string) {
        this.sheetService.modifySheet({ _id: sheetId, isJoinable: false });
        socket.broadcast.to('GridRoom').emit('Cancelled', sheetId);
    }

    @SubscribeMessage('joinGame')
    joinGame(socket: Socket, { playerName, sheetId }: { playerName: string; sheetId: string }) {
        socket.join(`GameRoom${sheetId}`);
        socket.broadcast.to(`GameRoom${sheetId}`).emit('UserJoined', { playerName, sheetId });
        // add the socket to the set of sockets that have received the event
        this.sentToSockets.add(socket.id);
    }
    @SubscribeMessage('playerRejected')
    playerRejected(socket: Socket, { playerName, sheetId }: { playerName: string; sheetId: string }) {
        socket.broadcast.to(`GameRoom${sheetId}`).emit('Rejection', { playerName, sheetId });
    }
    @SubscribeMessage('playerConfirmed')
    async playerConfirmed(socket: Socket, { player1, player2, sheetId }: { player1: string; player2: string; sheetId: string }) {
        const playSheet = await this.sheetService.getSheet(sheetId);
        const diffs = await this.gameService.getAllDifferences(playSheet);
        const newRoom: PlayRoom = {
            roomName: this.generateRandomId(ID_LENGTH),
            player1: { name: player1, socketId: socket.id, differencesFound: 0 },
            player2: undefined,
            sheet: playSheet,
            differences: diffs,
            numberOfDifferences: diffs.length,
            gameType: MULTIPLAYER_MODE,
            isGameDone: false,
        };
        this.rooms.push(newRoom);
        socket.join(newRoom.roomName);
        this.server.to(`GameRoom${sheetId}`).emit('MultiRoomCreated', { player2, roomName: newRoom.roomName });
        this.server.to(newRoom.roomName).emit(ChatEvents.RoomCreated, newRoom.roomName);
    }
    @SubscribeMessage('player2Joined')
    player2Joined(socket: Socket, { player2, roomName }: { player2: string; roomName: string }) {
        const room = this.rooms.find((res) => res.roomName === roomName);
        room.player2 = { name: player2, socketId: socket.id, differencesFound: 0 };
        socket.join(room.roomName);
        this.server.to(room.roomName).emit(ChatEvents.JoinedRoom, room);
    }

    @SubscribeMessage('rejectionConfirmed')
    async rejectionConfirmed(socket: Socket, sheetId: string) {
        await socket.leave(`GameRoom${sheetId}`);
    }
    @SubscribeMessage('deleteSheet')
    deleteSheet(socket: Socket, { sheetId }: { sheetId: string }) {
        this.sheetService.getSheet(sheetId).then((sheet) => {
            try {
                const originalImagePath = sheet.originalImagePath;
                if (originalImagePath) {
                    const originalImageFilePath = `./uploads/${originalImagePath}`;
                    try {
                        unlinkSync(originalImageFilePath);
                    } catch (error) {
                        this.logger.error(`Failed to delete original image for sheet with id ${sheetId}: ${error}`);
                    }
                }
                sheet.originalImagePath = null;
                // Delete the modified image
                const modifiedImagePath = sheet.modifiedImagePath;
                if (modifiedImagePath) {
                    const modifiedImageFilePath = `./uploads/${modifiedImagePath}`;
                    try {
                        unlinkSync(modifiedImageFilePath);
                    } catch (error) {
                        this.logger.error(`Failed to delete modified image for sheet with id ${sheetId}: ${error}`);
                    }
                }
                sheet.modifiedImagePath = null;
                this.sheetService.deleteSheet(sheetId);
                this.server.to('GridRoom').emit('sheetDeleted', sheetId);
            } catch (error) {
                this.logger.error(`Failed to delete sheet with id ${sheetId}: ${error}`);
            }
        });
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
        const room = this.rooms.find((iterRoom) => iterRoom.player1.socketId === socket.id || iterRoom.player2.socketId === socket.id);
        if (!room) return;
        socket.leave(room.roomName);
        if (!room.isGameDone) this.server.to(room.roomName).emit('playerLeft', 'opponent has left the game, you won!');
        else this.deleteRoom(room);
    }

    emitDeletedSheet(sheetId: string) {
        this.server.to('GridRoom').emit('SheetDeleted', sheetId);
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
        this.server.emit(ChatEvents.Clock, new Date().toLocaleTimeString());
    }
    private deleteRoom(room: PlayRoom) {
        this.rooms = this.rooms.filter((res) => res.roomName !== room.roomName);
    }
}
