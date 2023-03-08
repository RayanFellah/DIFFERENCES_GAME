import { Component, Inject, Input, OnInit } from '@angular/core';
import { ClientChatService } from '@app/services/chat-client.service';
import { EventService } from '@app/services/event-service.service';
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
    @Input() playerName: string;
    differenceFound: boolean = false;
    newMessage: string = '';
    currentRoom: PlayRoom;

    constructor(
        @Inject('EventService') private eventService: EventService,
        public chatService: ClientChatService,
        private gameSelector: GameSelectorService,
    ) {
        this.eventService.differenceFound$.subscribe((found) => {
            this.sendDifferenceFound(found);
        });
    }

    async ngOnInit(): Promise<void> {
        this.storeInfos();
        this.chatService.connect();
        if (this.gameSelector.create) {
            this.chatService.createRoom(this.playerName, this.gameSelector.currentGame, `${this.playerName}'s room`);
        } else {
            this.chatService.joinExistingRoom(this.playerName, this.currentRoom?.roomName);
        }
        if (!this.currentRoom) {
            await this.getRoom();
        }
        console.log(this.currentRoom);
    }

    sendDifferenceFound(found: boolean) {
        this.chatService.sendDifferenceFound(this.playerName, this.currentRoom?.roomName, found);
    }

    async storeInfos() {
        if (this.playerName) {
            this.chatService.localStorage.setData('currentPlayer', this.playerName);
        }

        if (!this.playerName) {
            this.playerName = await this.chatService.localStorage.getPlayerName('currentPlayer');
        }
    }

    async getRoom() {
        return await this.chatService.localStorage.getPlayRoom('currentRoom');
        // if (toParse) {
        //     this.currentRoom = JSON.parse(toParse);
        //     console.log(this.currentRoom);
        // }
    }

    send(): void {
        this.newMessage = '';
        if (this.currentRoom) {
            this.chatService.sendRoomMessage(this.currentRoom.roomName, this.newMessage);
        } else {
            throw new Error('currentRoom is undefined');
        }
    }
}
