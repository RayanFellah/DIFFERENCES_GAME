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
    newMessage: ChatMessage = { content: this.messageContent, type: 'player', sender: '' };

    ngOnInit() {
        this.newMessage.sender = this.playerName;
    }

    sendMessage() {
        this.messageEvent.emit(this.newMessage);
        this.newMessage.content = '';
    }
}
