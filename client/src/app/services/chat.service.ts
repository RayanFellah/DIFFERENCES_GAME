import { Injectable } from '@angular/core';
import { ChatEvents } from '@app/interfaces/chat-events';
import { ChatMessage } from '@common/chat-message';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { SocketClientService } from './socket-client/socket-client.service';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    chatMessagesSubject: BehaviorSubject<ChatMessage[]> = new BehaviorSubject<ChatMessage[]>([]);
    chatMessages$ = this.chatMessagesSubject.asObservable();
    messageTime: string;
    private unsubscribe$ = new Subject<void>();
    private roomName: string;

    constructor(private socketClientService: SocketClientService) {
        this.handleResponses();
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
        this.socketClientService.send('roomMessage', { message, roomName: this.roomName });
    }
    cleanup() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    handleResponses() {
        this.socketClientService
            .on<ChatMessage>('roomMessage')
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((message) => {
                message.time = this.messageTime;
                this.chatMessagesSubject.value.push(message);
                this.chatMessagesSubject.next(this.chatMessagesSubject.value);
            });

        this.socketClientService
            .on<Date>(ChatEvents.Clock)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((time) => {
                const now = new Date(time);
                this.messageTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            });
    }
}
