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
    @Input() playerName: string | undefined;
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
        this.chatService.connect();

        if (this.gameSelector.create) {
            this.chatService.createRoom(this.playerName, this.gameSelector.currentGame, `${this.playerName}'s room`);
        } else {
            if (this.playerName) {
                this.chatService.joinExistingRoom(this.playerName, this.currentRoom?.roomName);
            }
        }
        this.storeInfos();
        if (!this.currentRoom) {
            this.currentRoom = this.getRoom();
        }
        console.log(this.currentRoom);
    }

    sendDifferenceFound(found: boolean) {
        this.chatService.sendDifferenceFound(this.playerName, this.currentRoom?.roomName, found);
    }

    storeInfos() {
        if (this.playerName) {
            this.chatService.localStorage.setName(this.playerName);
        }

        if (!this.playerName) {
            this.playerName = this.chatService.localStorage.getName();
        }
    }

    getRoom() {
        return this.chatService.localStorage.getRoom();
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
