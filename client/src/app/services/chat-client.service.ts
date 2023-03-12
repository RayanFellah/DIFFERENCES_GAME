import { Injectable } from '@angular/core';
import { ChatEvents } from '@app/interfaces/chat-events';
import { ChatMessage } from '@app/interfaces/chat-message';
import { LocalStorageService } from '@app/services/local-storage.service';
import { PlayRoom } from '@common/play-room';
import { Sheet } from '@common/sheet';
import { BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
@Injectable({
    providedIn: 'root',
})
export class ClientChatService {
    roomMessages: ChatMessage[] = [];
    socket: Socket;
    serverTime: string;
    playerName: string | undefined;
    room: BehaviorSubject<PlayRoom | null> = new BehaviorSubject<PlayRoom | null>(null);
    reload: BehaviorSubject<PlayRoom | null> = new BehaviorSubject<PlayRoom | null>(null);

    constructor(public localStorage: LocalStorageService) {}
    connect() {
        this.socket = io(environment.socketServerUrl, { transports: ['websocket'], upgrade: false });
        this.handleResponses();
    }

    isAlive() {
        return this.socket.connected && this.socket;
    }

    createRoom(playerName: string | undefined, sheet: Sheet | undefined, roomName: string | null = null) {
        this.socket.emit(ChatEvents.CreateRoom, { sheet, roomName, playerName });
    }

    joinActiveRoom(playerName: string | undefined, roomName: string | null, sheet: Sheet) {
        this.socket.emit(ChatEvents.JoinRoom, { playerName, roomName, sheet });
    }

    sendDifferenceFound(playerName: string | undefined, roomName: string | undefined, found: boolean) {
        this.socket.emit(ChatEvents.ClickValidation, { playerName, roomName, found });
    }

    sendRoomMessage(roomName: string, playerName: string | undefined, message: string) {
        this.socket.emit(ChatEvents.RoomMessage, { roomName, playerName, message });
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

        this.socket.on(ChatEvents.RoomCreated, (roomReceived) => {
            this.localStorage.setPlayRoom(roomReceived.playRoom);
            this.room.next(roomReceived.playRoom);
        });

        this.socket.on(ChatEvents.JoinedRoom, (roomReceived) => {
            this.localStorage.setPlayRoom(roomReceived.playRoom);
            this.reload.next(roomReceived.playRoom);
        });

        this.socket.on(ChatEvents.RoomMessage, (message) => {
            let messageType: string;
            if (message.sender === this.playerName) {
                messageType = 'player';
            } else if (message.sender === 'game') {
                messageType = 'game';
            } else {
                messageType = 'opponent';
            }
            this.roomMessages.push({ content: message.content, type: messageType });
        });
    }
}
