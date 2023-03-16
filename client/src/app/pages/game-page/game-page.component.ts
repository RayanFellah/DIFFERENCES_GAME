import { Component, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatMessage } from '@app/interfaces/chat-message';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
/**
 * On met ici tout ce qui a rapport a la creation des games pour les sockets,
 * la gestion des clicks se fera dans le service de gamelogic, et la gestion du chat dans le chatboxcomponent
 */
export class GamePageComponent implements OnInit {
    @Output() playerName: string;
    difficulty: string;
    chatMessages: ChatMessage[] = [];
    gameType: string | null;
    sheetId: string | null;
    roomName: string | null;
    constructor(private activatedRoute: ActivatedRoute, private socketService: SocketClientService) {}

    ngOnInit() {
        const name = this.activatedRoute.snapshot.paramMap.get('name');
        if (!name) this.playerName = 'Anonymous';
        else this.playerName = name;
        this.gameType = this.activatedRoute.snapshot.paramMap.get('type');
        this.sheetId = this.activatedRoute.snapshot.paramMap.get('id');
        this.roomName = this.activatedRoute.snapshot.paramMap.get('roomId');
        console.log(this.socketService.socket.id);
        this.handleResponses();
    }
    onDifficultyChange(eventData: string) {
        this.difficulty = eventData;
    }

    sendMessage(message: ChatMessage) {
        this.chatMessages.push(message);
        this.socketService.send('roomMessage', { message, roomName: this.roomName });
        console.log('sending' + message.content);
    }
    createSoloGame() {
        const data = { name: this.playerName, sheet: this.sheetId };
        this.socketService.send('createSoloGame', data);
    }

    handleResponses() {
        this.socketService.on('roomMessage', (message: ChatMessage) => {
            console.log('received' + message.content);
            message.type = 'opponent';
            this.chatMessages.push(message);
        });
    }
}
