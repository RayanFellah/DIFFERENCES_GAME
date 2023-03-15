import { Coord } from '@app/interfaces/coord';
import { GameLogicService } from '@app/services/game-logic/game-logic.service';
import { SheetService } from '@app/services/sheet/sheet.service';
import { PlayRoom } from '@common/play-room';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { unlinkSync } from 'fs';
import { Server, Socket } from 'socket.io';
import { DELAY_BEFORE_EMITTING_TIME, PRIVATE_ROOM_ID } from './chat.gateway.constants';
import { ChatEvents } from './chat.gateway.events';

@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;

    sentToSockets = new Set<string>();
    private readonly room = PRIVATE_ROOM_ID;
    private rooms: PlayRoom[] = [];

    constructor(private readonly logger: Logger, private readonly sheetService: SheetService, private gameService: GameLogicService) {}

    @SubscribeMessage(ChatEvents.BroadcastAll)
    broadcastAll(socket: Socket, message: string) {
        this.server.emit(ChatEvents.MassMessage, `${socket.id} : ${message}`);
    }

    @SubscribeMessage(ChatEvents.JoinRoom)
    joinActiveRoom(socket: Socket, payload) {
        const room = this.rooms.find((playRoom) => playRoom.roomName === payload.roomName);
        if (!room) {
            // this.createRoom(socket, payload);
            return;
        }
        if (room.player1.name === payload.playerName) {
            room.player1.socketId = socket.id;
            socket.join(room.roomName);
            this.server.to(payload.roomName).emit(ChatEvents.JoinedRoom, { playRoom: room });
        } else {
            room.player2 = { name: payload.playerName, socketId: socket.id, differencesFound: 0 };
            socket.join(room.roomName);
            this.server.to(payload.roomName).emit(ChatEvents.JoinedRoom, { playRoom: room });
        }
    }

    @SubscribeMessage('createSoloGame')
    async createSoloRoom(socket: Socket, payload) {
        console.log('in create');
        const playSheet = await this.sheetService.getSheet(payload.sheetId);
        const diffs = await this.gameService.getAllDifferences(playSheet);
        const newRoom: PlayRoom = {
            roomName: `${payload.name}'s room`,
            player1: { name: payload.name, socketId: socket.id, differencesFound: 0 },
            player2: undefined,
            sheet: playSheet,
            differences: diffs,
            numberOfDifferences: diffs.length,
        };
        this.rooms.push(newRoom);
        socket.join(newRoom.roomName);
        this.server.to(newRoom.roomName).emit(ChatEvents.RoomCreated, newRoom.roomName);
    }

    @SubscribeMessage('click')
    validateClick(client: Socket, payload) {
        const clickCoord: Coord = { posX: payload.x, posY: payload.y };
        const room = this.rooms.find((res) => res.roomName === payload.roomName);
        const player = room.player1.name === payload.playerName ? room.player1 : room.player2;
        console.log(room.differences.length);
        console.log(player.differencesFound);

        for (const diff of room.differences) {
            for (const coords of diff.coords) {
                if (JSON.stringify(clickCoord) === JSON.stringify(coords)) {
                    console.log('found');
                    player.differencesFound++;
                    this.server.to(payload.roomName).emit('found', {
                        coords: diff.coords,
                        player: payload.playerName,
                        diffsLeft: room.differences.length - player.differencesFound,
                    });
                    room.differences = room.differences.filter((it) => JSON.stringify(diff) !== JSON.stringify(it));
                }
            }
        }
        if (player.differencesFound === room.numberOfDifferences) {
            this.server.to(payload.roomName).emit('gameDone', `${payload.playerName} has won!`);
            return;
        }
        this.server.to(payload.roomName).emit('error', payload.playerName);
    }

    @SubscribeMessage(ChatEvents.RoomMessage)
    roomMessage(socket: Socket, payload) {
        if (socket.rooms.has(payload.roomName) && payload.message.length > 0) {
            this.server.to(payload.roomName).emit(ChatEvents.RoomMessage, { sender: payload.playerName, content: payload.message });
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
        socket.broadcast.to(`GameRoom${sheetId}`).emit('UserJoined', { playerName, sheetId });
        console.log('user joined');
        // add the socket to the set of sockets that have received the event
        this.sentToSockets.add(socket.id);
    }
    @SubscribeMessage('deleteSheet')
    deleteSheet(socket: Socket, { sheetId }: { sheetId: string }) {
        this.sheetService.getSheet(sheetId).then((sheet) => {
            const originalImagePath = sheet.originalImagePath;
            if (originalImagePath) {
                const originalImageFilePath = `./uploads/${originalImagePath}`;
                try {
                    unlinkSync(originalImageFilePath);
                } catch (error) {
                    console.error(`Failed to delete original image for sheet with id ${sheetId}: ${error}`);
                }
            }

            // Delete the modified image
            const modifiedImagePath = sheet.modifiedImagePath;
            if (modifiedImagePath) {
                const modifiedImageFilePath = `./uploads/${modifiedImagePath}`;
                try {
                    unlinkSync(modifiedImageFilePath);
                } catch (error) {
                    console.error(`Failed to delete modified image for sheet with id ${sheetId}: ${error}`);
                }
            }
        });
        this.sheetService.deleteSheet(sheetId);
        socket.to('GridRoom').emit('sheetDeleted', { sheetId });
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
        this.logger.log(`Client disconnected: ${socket.id}`);
        let name: string;
        for (const room of this.rooms) {
            if (socket.rooms.has(room.roomName)) {
                socket.leave(room.roomName);
                if (room.player1.socketId === socket.id) {
                    name = room.player1.name;
                    room.player1 = undefined;
                } else {
                    name = room.player2.name;
                    room.player2 = undefined;
                }
                this.server.to(room.roomName).emit(ChatEvents.RoomMessage, { sender: 'game', message: `${name} has left the room` });
            }
        }
    }

    emitDeletedSheet(sheetId: string) {
        this.server.to('GridRoom').emit('SheetDeleted', sheetId);
    }

    private emitTime() {
        this.server.emit(ChatEvents.Clock, new Date().toLocaleTimeString());
    }
    private deleteRoom(room: PlayRoom) {
        this.rooms = this.rooms.filter((res) => res.roomName !== room.roomName);
    }
}
