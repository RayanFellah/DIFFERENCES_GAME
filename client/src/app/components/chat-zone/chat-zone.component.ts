import { Component, EventEmitter, Input, OnDestroy, OnInit } from '@angular/core';
import { ClientChatService } from '@app/services/chat-client.service';
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
export class ChatZoneComponent implements OnInit, OnDestroy {
    @Input() playerName: string | undefined = 'skander';
    @Input() differenceFound: EventEmitter<boolean> = new EventEmitter();
    newMessage: string = '';
    chatService: ClientChatService;
    currentRoom: PlayRoom | undefined;

    constructor(private storage: Storage, private gameSelector: GameSelectorService) {
        this.chatService = new ClientChatService(new LocalStorageService(this.storage));
    }

    async ngOnInit(): Promise<void> {
        this.storeInfos();
        this.chatService.connect();
        this.chatService.createRoom(this.playerName, this.gameSelector.currentGame, `${this.playerName}'s room`);
        if (!this.currentRoom) {
            await this.getRoom();
        }

        this.differenceFound.subscribe((found: boolean) => {
            this.sendDifferenceFound(found);
        });
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
    ngOnDestroy(): void {
        this.differenceFound.unsubscribe();
    }
}
