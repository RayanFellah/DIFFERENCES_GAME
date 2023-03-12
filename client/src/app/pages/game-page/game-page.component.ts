import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatMessage } from '@app/interfaces/chat-message';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    playerName: string;
    difficulty: string;
    chatMessages: ChatMessage[] = [];
    gameType: string | null;
    sheetId: string | null;
    constructor(private activatedRoute: ActivatedRoute, private socketService: SocketClientService) {}

    ngOnInit() {
        const name = this.activatedRoute.snapshot.paramMap.get('name');
        if (!name) this.playerName = 'Anonymous';
        else this.playerName = name;
        this.gameType = this.activatedRoute.snapshot.paramMap.get('type');
        this.sheetId = this.activatedRoute.snapshot.paramMap.get('id');
    }
    onDifficultyChange(eventData: string) {
        this.difficulty = eventData;
    }

    sendMessage(message: ChatMessage) {
        this.chatMessages.push(message);
        this.socketService.send('roomMessage', message);
    }

    joinRoom() {
        this.socketService.send('joinRoom', this.playerName);
    }

    createRoom() {
        this.socketService.send('createRoom', this.playerName);
    }

    createSoloGame() {
        const data = { name: this.playerName, sheet: this.sheetId };
        this.socketService.send('createSoloGame', data);
    }

    handleResponses() {
        this.socketService.on('roomMessage', (message: ChatMessage) => {
            message.type = 'opponent';
            this.chatMessages.push(message);
        });
    }
}
