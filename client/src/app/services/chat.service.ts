import { Injectable } from '@angular/core';
import { ChatMessage } from '@common/chat-message';
import { BehaviorSubject } from 'rxjs';
import { SocketClientService } from './socket-client/socket-client.service';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    chatMessagesSubject: BehaviorSubject<ChatMessage[]> = new BehaviorSubject<ChatMessage[]>([]);
    chatMessages$ = this.chatMessagesSubject.asObservable();
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
        this.chatMessagesSubject.value.push(message);
        this.socketClient.send('roomMessage', { message, roomName: this.roomName });
    }

    handleResponses() {
        this.socketClient.on<ChatMessage>('roomMessage', (message: ChatMessage) => {
            this.chatMessagesSubject.value.push(message);
            this.chatMessagesSubject.next(this.chatMessagesSubject.value);
        });
    }
}
