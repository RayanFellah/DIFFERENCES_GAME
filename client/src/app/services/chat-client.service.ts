import { Injectable } from '@angular/core';
import { ChatEvents } from '@app/interfaces/chat-events';
import { ChatMessage } from '@app/interfaces/chat-message';
import { LocalStorageService } from '@app/services/local-storage.service';
import { PlayRoom } from '@common/play-room';
import { Sheet } from '@common/sheet';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
@Injectable({
    providedIn: 'root',
})
export class ClientChatService {
    roomMessages: ChatMessage[] = [];
    socket: Socket;
    serverTime: string;
    playerName: string = 'skander';
    room: PlayRoom;

    constructor(public localStorage: LocalStorageService) {}
    connect() {
        this.socket = io(environment.socketServerUrl, { transports: ['websocket'], upgrade: false });
        this.handleResponses();
    }

    isAlive() {
        return this.socket.connected && this.socket;
    }

    createRoom(playerName: string | undefined, sheet: Sheet | undefined, roomName: string | null = null) {
        this.socket.emit(ChatEvents.JoinRoom, { sheet, roomName, playerName });
    }

    joinExistingRoom(playerName: string, roomName: string) {
        this.createRoom(playerName, undefined, roomName);
    }

    sendDifferenceFound(playerName: string | undefined, roomName: string | undefined, found: boolean) {
        this.socket.emit(ChatEvents.ClickValidation, { playerName, roomName, found });
    }

    sendRoomMessage(roomName: string, message: string) {
        this.socket.emit(ChatEvents.RoomMessage, { roomName, message });
    }

    handleResponses() {
        this.socket.on(ChatEvents.CongratMessage, (message) => {
            this.roomMessages.push({ content: message, type: 'game' });
        });

        this.socket.on(ChatEvents.ClickValidated, (message) => {
            this.roomMessages.push({ content: message.content, type: 'game' });
        });

        this.socket.on(ChatEvents.Clock, (time) => {
            this.serverTime = time;
        });

        this.socket.on(ChatEvents.JoinedRoom, (roomReceived) => {
            this.localStorage.setData('currentRoom', roomReceived.playRoom);
        });

        this.socket.on(ChatEvents.RoomMessage, (message) => {
            let player: string;
            if (message.sender === this.playerName) {
                player = 'player';
            } else if (message.sender === 'game') {
                player = 'game';
            } else {
                player = 'opponent';
            }
            this.roomMessages.push({ content: message.content, type: player });
        });
    }
}
