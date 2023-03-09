import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
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
export class ChatZoneComponent implements OnInit, OnDestroy {
    @Input() playerName: string | undefined;
    differenceFound: boolean = false;
    newMessage: string = '';
    currentRoom: PlayRoom | null;
    constructor(
        @Inject('EventService') private eventService: EventService,
        public chatService: ClientChatService,
        private gameSelector: GameSelectorService,
    ) {
        this.eventService.differenceFound$.subscribe((found) => {
            this.sendDifferenceFound(found);
        });
        this.chatService.connect();
    }

    async ngOnInit() {
        await this.start();
    }

    async start() {
        this.storeInfos();
        if (!this.playerName) {
            this.playerName = this.chatService.localStorage.getName();
        }
        if (this.gameSelector.create) {
            this.createGame();
        } else {
            this.currentRoom = await this.getRoom();
            this.chatService.joinActiveRoom(this.playerName, this.currentRoom.roomName);
        }
    }

    sendDifferenceFound(found: boolean) {
        this.chatService.sendDifferenceFound(this.playerName, this.currentRoom?.roomName, found);
    }

    createGame() {
        this.chatService.room.subscribe((room) => {
            if (room) {
                this.currentRoom = room;
            }
            if (this.gameSelector.create) {
                this.chatService.createRoom(this.playerName, this.gameSelector.currentGame, `${this.playerName}'s room`);
                this.gameSelector.create = false;
            }
        });
    }

    storeInfos() {
        if (this.playerName) {
            this.chatService.localStorage.setName(this.playerName);
        }
        if (!this.playerName) {
            this.playerName = this.chatService.localStorage.getName();
        }
        this.chatService.playerName = this.playerName;
    }
    async getRoom() {
        return new Promise<PlayRoom>((resolve) => {
            resolve(this.chatService.localStorage.getRoom());
        });
    }

    send(): void {
        if (this.currentRoom) {
            this.chatService.sendRoomMessage(this.currentRoom.roomName, this.playerName, this.newMessage);
        } else {
            throw new Error('currentRoom is undefined');
        }
        this.newMessage = '';
    }
    ngOnDestroy(): void {
        this.currentRoom = null;
    }
}
