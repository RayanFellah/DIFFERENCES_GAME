import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ChatMessage } from '@common/chat-message';

@Component({
    selector: 'app-chat-zone',
    templateUrl: './chat-zone.component.html',
    styleUrls: ['./chat-zone.component.scss'],
})
export class ChatZoneComponent {
    @Input() playerName: string;
    @Input() opponent: string;
    @Input() chatMessages: ChatMessage[] = [];
    @Output() messageEvent = new EventEmitter<ChatMessage>();

    messageContent: string = '';
    newMessage: ChatMessage;

    sendMessage() {
        if (this.messageContent.length > 0) {
            this.newMessage = { content: this.messageContent, type: 'player', time: '' };
            this.messageEvent.emit(this.newMessage);
            this.messageContent = '';
        }
    }
}
