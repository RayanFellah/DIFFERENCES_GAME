import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ChatMessage } from '@app/interfaces/chat-message';

@Component({
    selector: 'app-chat-zone',
    templateUrl: './chat-zone.component.html',
    styleUrls: ['./chat-zone.component.scss'],
})
export class ChatZoneComponent implements OnInit {
    @Input() playerName: string;
    @Input() opponentName: string;
    @Input() chatMessages: ChatMessage[] = [];
    @Output() messageEvent = new EventEmitter<ChatMessage>();
    messageContent: string = '';
    newMessage: ChatMessage;

    ngOnInit() {
        this.newMessage.sender = this.playerName;
    }

    sendMessage() {
        this.newMessage = { content: this.messageContent, type: 'player', sender: '' };
        this.messageEvent.emit(this.newMessage);
        this.messageContent = '';
    }
}
