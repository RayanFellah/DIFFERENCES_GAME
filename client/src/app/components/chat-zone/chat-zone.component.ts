import { Component, Input, OnInit } from '@angular/core';
import { ClientChatService } from '@app/services/chat-client.service';
import { GameSelectorService } from '@app/services/game-selector.service';
import { LocalStorageService } from '@app/services/local-storage.service';
import { PlayRoom } from '@common/play-room';

@Component({
    selector: 'app-chat-zone',
    templateUrl: './chat-zone.component.html',
    styleUrls: ['./chat-zone.component.scss'],
    providers: [LocalStorageService],
})
export class ChatZoneComponent implements OnInit {
    @Input() playerName: string | null;
    newMessage: string = '';
    chatService: ClientChatService;
    currentRoom: PlayRoom | undefined;

    constructor(private storage: Storage, private gameSelector: GameSelectorService) {
        this.chatService = new ClientChatService(new LocalStorageService(this.storage));
    }

    ngOnInit(): void {
        this.storeInfos();
        this.chatService.connect();
        this.chatService.handleJoined();
        this.chatService.createRoom(this.playerName, this.gameSelector.currentGame, `${this.playerName}'s room`);
        if (!this.currentRoom) {
            this.getRoom();
        }
    }

    sendDifferenceFound() {
        if (this.currentRoom && this.playerName) {
            this.chatService.sendDifferenceFound(this.playerName, this.currentRoom?.roomName);
        }
    }

    storeInfos() {
        if (this.playerName) {
            this.storage.setItem('currentPlayer', this.playerName);
        }

        if (!this.playerName) {
            this.playerName = this.storage.getItem('currentPlayer');
        }
    }

    getRoom() {
        const toParse = this.storage.getItem('currentRoom');
        if (toParse) {
            this.currentRoom = JSON.parse(toParse);
        }
    }

    send(): void {
        if (this.currentRoom) {
            this.chatService.sendRoomMessage(this.currentRoom.roomName, this.newMessage);
            this.newMessage = '';
        } else {
            throw new Error('currentRoom is undefined');
        }
    }
}
