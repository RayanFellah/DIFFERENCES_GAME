import { Component, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { ChatMessage } from '@app/interfaces/chat-message';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    @ViewChild(PlayAreaComponent) playArea: PlayAreaComponent;
    @Output() playerName: string;
    difficulty: string;
    chatMessages: ChatMessage[] = [];
    sheetId: string | null;
    roomName: string | null;
    constructor(private activatedRoute: ActivatedRoute, private socketService: SocketClientService) {}

    ngOnInit() {
        this.playerName = this.activatedRoute.snapshot.paramMap.get('name') as string;
        this.sheetId = this.activatedRoute.snapshot.paramMap.get('id');
        this.roomName = this.activatedRoute.snapshot.paramMap.get('roomId');
        this.handleResponses();
    }
    onDifficultyChange(eventData: string) {
        this.difficulty = eventData;
    }
    handleResponses() {
        this.socketService.on('roomMessage', (message: ChatMessage) => {
            message.type = 'opponent';
            this.chatMessages.push(message);
        });
    }
    sendMessage(message: ChatMessage) {
        this.chatMessages.push(message);
        this.socketService.send('roomMessage', { message, roomName: this.roomName });
    }
}
