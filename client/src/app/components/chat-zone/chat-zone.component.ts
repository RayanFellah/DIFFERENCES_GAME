import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ChatService } from '@app/services/chat.service';

import { ChatMessage } from '@common/chat-message';

@Component({
    selector: 'app-chat-zone',
    templateUrl: './chat-zone.component.html',
    styleUrls: ['./chat-zone.component.scss'],
})
export class ChatZoneComponent implements OnInit, OnDestroy, AfterViewChecked {
    @ViewChild('chatArea') chatArea: ElementRef;
    @Input() playerName: string;
    @Input() replayMessages: ChatMessage[] = [];
    @Input() isReplay: boolean = false;
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

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    scrollToBottom(): void {
        this.chatArea.nativeElement.scrollTop = this.chatArea.nativeElement.scrollHeight;
    }
    sendMessageTL() {
        if (this.messageContent.length > 0) {
            this.newMessage = { name: this.playerName, content: this.messageContent, type: 'player' };
            this.messageEvent.emit(this.newMessage);
            this.chatService.sendMessage(this.newMessage);
            this.messageContent = '';
            this.scrollToBottom();
        }
    }
    ngOnDestroy(): void {
        location.reload();
    }
}
