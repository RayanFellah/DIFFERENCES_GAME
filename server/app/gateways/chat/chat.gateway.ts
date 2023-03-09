import { ClickValidationPayload } from '@app/interfaces/chat-clickValidate.interface';
import { ChatGatewayPayload } from '@app/interfaces/chat-gateway.interface';
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

    constructor(private readonly logger: Logger) {}

    @SubscribeMessage(ChatEvents.Message)
    message(_: Socket, message: string) {
        this.logger.log(`Message reÃ§u : ${message}`);
    }

    @SubscribeMessage(ChatEvents.BroadcastAll)
    broadcastAll(socket: Socket, message: string) {
        this.server.emit(ChatEvents.MassMessage, `${socket.id} : ${message}`);
    }

    @SubscribeMessage(ChatEvents.JoinRoom)
    joinRoom(socket: Socket, payload: ChatGatewayPayload) {
        const room = this.rooms.find((roomJoined) => roomJoined.roomName === payload.roomName);
        if (room && room.player1 && room.player2) {
            return;
        }
        if (room) {
            if (!room.player1) {
                room.player1 = { name: payload.playerName, socketId: socket.id };
            } else {
                room.player2 = { name: payload.playerName, socketId: socket.id };
            }
            socket.join(room.roomName);
            this.server.to(payload.roomName).emit(ChatEvents.JoinedRoom, { playRoom: room });
        } else {
            const newRoom: PlayRoom = {
                roomName: payload.roomName,
                player1: { name: payload.playerName, socketId: socket.id },
                player2: undefined,
                sheet: payload.sheet,
            };
            this.rooms.push(newRoom);
            socket.join(newRoom.roomName);
            console.log(newRoom);
            this.server.to(payload.roomName).emit(ChatEvents.JoinedRoom, { playRoom: newRoom });
        }
    }

    @SubscribeMessage(ChatEvents.RoomMessage)
    roomMessage(socket: Socket, payload: ChatGatewayPayload) {
        if (socket.rooms.has(payload.roomName) && payload.message.length > 0) {
            this.server.to(payload.roomName).emit(ChatEvents.RoomMessage, { sender: payload.playerName, content: payload.message });
        }
    }

    @SubscribeMessage(ChatEvents.ClickValidation)
    validateClick(socket: Socket, payload: ClickValidationPayload) {
        console.log('click received');
        console.log(payload.found);
        const message = payload.found ? `${payload.playerName} has found a difference` : `Error from ${payload.playerName}`;
        if (socket.rooms.has(payload.roomName)) {
            this.server.to(payload.roomName).emit(ChatEvents.ClickValidated, { sender: 'game', content: message });
        }
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

    private emitTime() {
        this.server.emit(ChatEvents.Clock, new Date().toLocaleTimeString());
    }
    private deleteRoom(room: PlayRoom) {
        this.rooms = this.rooms.filter((res) => res.roomName !== room.roomName);
    }
}
