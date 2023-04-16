import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ChatService } from '@app/services/chat.service';

import { ChatMessage } from '@common/chat-message';

@Component({
    selector: 'app-chat-zone',
    templateUrl: './chat-zone.component.html',
    styleUrls: ['./chat-zone.component.scss'],
})
export class ChatZoneComponent implements OnInit {
    @Input() playerName: string;
    @Input() opponent: string;
    @Input() chatMessages: ChatMessage[] = [];
    @Output() messageEvent = new EventEmitter<ChatMessage>();
    @Input() gameMode: string = 'Classic';
    @Input() roomName: string;
    messageContent: string = '';
    newMessage: ChatMessage;
    constructor(private chatService: ChatService) {}

    ngOnInit() {
        this.chatService.chatMessages$.subscribe((messages: ChatMessage[]) => {
            this.chatMessages = messages;
        });
        this.chatService.room = this.roomName;
        this.chatService.handleResponses();
    }
    sendMessage() {
        if (this.messageContent.length > 0) {
            if (this.gameMode === 'Classic') {
                this.newMessage = { playerName: this.playerName, content: this.messageContent, type: 'player' };
                this.messageEvent.emit(this.newMessage);
                this.messageContent = '';
            } else {
                this.sendMessageTL();
            }
        }
    }

    sendMessageTL() {
        if (this.messageContent.length > 0) {
            this.newMessage = { playerName: this.playerName, content: this.messageContent, type: 'player' };
            this.chatService.sendMessage(this.newMessage);
            this.messageContent = '';
        }
    }
}
