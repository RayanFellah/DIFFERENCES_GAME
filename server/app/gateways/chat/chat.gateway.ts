import { ChatGatewayPayload } from '@app/interfaces/chat-gateway.interface';
import { SheetService } from '@app/services/sheet/sheet.service';
import { PlayRoom } from '@common/play-room';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DELAY_BEFORE_EMITTING_TIME, PRIVATE_ROOM_ID } from './chat.gateway.constants';
import { ChatEvents } from './chat.gateway.events';

@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;

    private readonly room = PRIVATE_ROOM_ID;
    private rooms: PlayRoom[] = [];

    constructor(private readonly logger: Logger, private readonly sheetService: SheetService) {}

    @SubscribeMessage(ChatEvents.BroadcastAll)
    broadcastAll(socket: Socket, message: string) {
        this.server.emit(ChatEvents.MassMessage, `${socket.id} : ${message}`);
    }

    @SubscribeMessage(ChatEvents.JoinRoom)
    joinActiveRoom(socket: Socket, payload) {
        const room = this.rooms.find((playRoom) => playRoom.roomName === payload.roomName);
        if (room.player1.name === payload.playerName) {
            room.player1.socketId = socket.id;
            socket.join(room.roomName);
            this.server.to(payload.roomName).emit(ChatEvents.JoinedRoom, { playRoom: room });
        } else {
            room.player2 = { name: payload.playerName, socketId: socket.id };
            socket.join(room.roomName);
            this.server.to(payload.roomName).emit(ChatEvents.JoinedRoom, { playRoom: room });
        }
    }

    @SubscribeMessage(ChatEvents.CreateRoom)
    createRoom(socket: Socket, payload) {
        const newRoom: PlayRoom = {
            roomName: payload.roomName,
            player1: { name: payload.playerName, socketId: socket.id },
            player2: undefined,
            sheet: payload.sheet,
        };
        this.rooms.push(newRoom);
        socket.join(newRoom.roomName);
        this.server.to(payload.roomName).emit(ChatEvents.RoomCreated, { playRoom: newRoom });
    }

    @SubscribeMessage(ChatEvents.RoomMessage)
    roomMessage(socket: Socket, payload: ChatGatewayPayload) {
        if (socket.rooms.has(payload.roomName) && payload.message.length > 0) {
            this.server.to(payload.roomName).emit(ChatEvents.RoomMessage, { sender: payload.playerName, content: payload.message });
        }
    }

    @SubscribeMessage(ChatEvents.ClickValidation)
    validateClick(socket: Socket, payload) {
        const message = payload.found ? `${payload.playerName} has found a difference` : `Error from ${payload.playerName}`;
        if (socket.rooms.has(payload.roomName)) {
            this.server.to(payload.roomName).emit(ChatEvents.ClickValidated, { sender: 'game', content: message });
        }
    }

    @SubscribeMessage(ChatEvents.JoinGridRoom)
    joinGridRoom(socket: Socket) {
        socket.join('GridRoom');
    }
    @SubscribeMessage('gameJoinable')
    joinableGame(socket: Socket, sheetId: string) {
        this.sheetService.modifySheet({ _id: sheetId, isJoinable: true });
        socket.broadcast.to('GridRoom').emit('Joinable', sheetId);
    }

    @SubscribeMessage('cancelGameCreation')
    cancelGameCreation(socket: Socket, sheetId: string) {
        this.sheetService.modifySheet({ _id: sheetId, isJoinable: false });
        socket.broadcast.to('GridRoom').emit('Cancelled', sheetId);
    }

    @SubscribeMessage('joinGame')
    joinGame(socket: Socket, { playerName, sheetId }: { playerName: string; sheetId: string }) {
        socket.broadcast.to('GridRoom').emit('UserJoined', { playerName, sheetId });
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
