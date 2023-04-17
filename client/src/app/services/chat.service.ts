import { Injectable } from '@angular/core';
import { ChatEvents } from '@app/interfaces/chat-events';
import { ChatMessage } from '@common/chat-message';
import { BehaviorSubject } from 'rxjs';
import { SocketClientService } from './socket-client/socket-client.service';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    chatMessagesSubject: BehaviorSubject<ChatMessage[]> = new BehaviorSubject<ChatMessage[]>([]);
    chatMessages$ = this.chatMessagesSubject.asObservable();
    messageTime: string;
    private roomName: string;

    constructor(private socketClient: SocketClientService) {
        if (!this.socketClient.isSocketAlive()) {
            this.socketClient.connect();
        }
    }

    get chatMessagesValue(): ChatMessage[] {
        return this.chatMessagesSubject.value;
    }

    set room(roomName: string) {
        this.roomName = roomName;
    }

    sendMessage(message: ChatMessage) {
        message.time = this.messageTime;
        this.chatMessagesSubject.value.push(message);
        this.socketClient.send('roomMessage', { message, roomName: this.roomName });
    }

    handleResponses() {
        this.socketClient.on<ChatMessage>('roomMessage', (message: ChatMessage) => {
            message.time = this.messageTime;
            this.chatMessagesSubject.value.push(message);
            this.chatMessagesSubject.next(this.chatMessagesSubject.value);
        });
        this.socketClient.on<Date>(ChatEvents.Clock, (time: Date) => {
            const now = new Date(time);
            this.messageTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        });
    }
}
