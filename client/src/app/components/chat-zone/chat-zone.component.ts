import { Component, Input, OnInit, Inject } from '@angular/core';
import { ClientChatService } from '@app/services/chat-client.service';
import { EventService } from '@app/services/event-service.service';
import { GameSelectorService } from '@app/services/game-selector.service';
import { LocalStorageService } from '@app/services/local-storage.service';
import { PlayRoom } from '@common/play-room';
import { Storage } from '@ionic/storage';

@Component({
    selector: 'app-chat-zone',
    templateUrl: './chat-zone.component.html',
    styleUrls: ['./chat-zone.component.scss'],
    providers: [LocalStorageService],
})
export class ChatZoneComponent implements OnInit {
    @Input() playerName: string | undefined = 'skander';
    differenceFound: boolean = false;
    newMessage: string = '';
    chatService: ClientChatService;
    currentRoom: PlayRoom | undefined;

    constructor(@Inject('EventService') private eventService: EventService, private storage: Storage, private gameSelector: GameSelectorService) {
        this.chatService = new ClientChatService(new LocalStorageService(this.storage));
        this.eventService.differenceFound$.subscribe((found) => {
            this.sendDifferenceFound(found);
            console.log('sent');
        });
    }

    async ngOnInit(): Promise<void> {
        this.storeInfos();
        this.chatService.connect();
        this.chatService.createRoom(this.playerName, this.gameSelector.currentGame, `${this.playerName}'s room`);
        if (!this.currentRoom) {
            await this.getRoom();
        }
    }

    sendDifferenceFound(found: boolean) {
        this.chatService.sendDifferenceFound(this.playerName, this.currentRoom?.roomName, found);
    }

    async storeInfos() {
        if (this.playerName) {
            this.chatService.localStorage.setData('currentPlayer', this.playerName);
        }

        if (!this.playerName) {
            this.playerName = await this.chatService.localStorage.getData('currentPlayer');
        }
    }

    async getRoom() {
        const toParse = await this.chatService.localStorage.getData('currentRoom');
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
