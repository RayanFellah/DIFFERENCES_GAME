import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ChatMessage } from '@app/interfaces/chat-message';
import { LocalStorageService } from '@app/services/local-storage.service';

@Component({
    selector: 'app-chat-zone',
    templateUrl: './chat-zone.component.html',
    styleUrls: ['./chat-zone.component.scss'],
    providers: [LocalStorageService],
})
export class ChatZoneComponent implements OnInit, OnDestroy {
    @Input() playerName: string;
    @Input() opponentName: string;
    @Input() chatMessages: ChatMessage[] = [];
    @Output() messageEvent = new EventEmitter<ChatMessage>();
    messageContent: string = '';
    newMessage: ChatMessage = { content: this.messageContent, type: 'player', sender: '' };

    ngOnInit() {
        this.newMessage.sender = this.playerName;
    }

    sendMessage() {
        this.messageEvent.emit(this.newMessage);
        this.newMessage.content = '';
    }
}
