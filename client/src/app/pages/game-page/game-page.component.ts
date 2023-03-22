/* eslint-disable max-params */
import { Component, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogComponent } from '@app/components/dialogue/dialog.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { ChatEvents } from '@app/interfaces/chat-events';
import { GameStateService } from '@app/services/game-state/game-state.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { ChatMessage } from '@common/chat-message';
import { Player } from '@common/player';
@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    providers: [DialogComponent],
})
export class GamePageComponent implements OnInit, OnDestroy {
    @ViewChild(PlayAreaComponent) playArea: PlayAreaComponent;
    @Output() playerName: string;
    difficulty: string;
    chatMessages: ChatMessage[] = [];
    sheetId: string | null;
    roomName: string | null;
    differences: number;
    person: Player;
    opponent: Player;
    startTime: Date;
    formattedTime: string;
    timer: boolean;
    constructor(
        private activatedRoute: ActivatedRoute,
        private socketService: SocketClientService,
        private gameStateService: GameStateService,
        private router: Router,
        private readonly dialog: DialogComponent,
    ) {}
    ngOnInit() {
        if (!this.gameStateService.isGameInitialized) {
            this.router.navigate(['/main']);
        } else {
            this.playerName = this.activatedRoute.snapshot.paramMap.get('name') as string;
            this.sheetId = this.activatedRoute.snapshot.paramMap.get('id');
            this.roomName = this.activatedRoute.snapshot.paramMap.get('roomId');
            this.startTime = new Date();
            this.timer = true;
            if (this.socketService.isSocketAlive()) this.handleResponses();
        }
    }

    onDifficultyChange(eventData: string) {
        this.difficulty = eventData;
    }
    handleResponses() {
        this.socketService.on<ChatMessage>(ChatEvents.RoomMessage, (message: ChatMessage) => {
            message.type = message.type !== 'game' ? 'opponent' : 'game';
            this.chatMessages.push(message);
        });
        this.socketService.on<Player[]>('players', (players: Player[]) => {
            if (!players[1]) this.person = players[0];
            else {
                if (players[0].socketId === this.socketService.socket.id) {
                    this.person = players[0];
                    this.opponent = players[1];
                } else {
                    this.person = players[1];
                    this.opponent = players[0];
                }
            }
        });
        this.socketService.on<Date>(ChatEvents.Clock, (time: Date) => {
            if (!this.timer) return;
            const MILLISECONDS = 1000;
            const MINUTES = 60;
            const now = new Date(time);
            const elapsedTimeInSeconds = Math.floor((now.getTime() - this.startTime.getTime()) / MILLISECONDS);
            const minutes = Math.floor(elapsedTimeInSeconds / MINUTES);
            const seconds = elapsedTimeInSeconds % MINUTES;
            this.formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        });

        this.socketService.on('gameDone', () => {
            this.timer = false;
        });
        this.socketService.on<Player>('foundDiff', (player: Player) => {
            if (this.person.socketId === player.socketId) this.person = player;
            else this.opponent = player;
        });

        this.socketService.on<number>('numberOfDifferences', (diff: number) => {
            this.differences = diff;
        });
        this.socketService.on<string>('gameDone', (message: string) => {
            this.dialog.openGameOverDialog(message);
        });
    }
    sendMessage(message: ChatMessage) {
        this.chatMessages.push(message);
        this.socketService.send('roomMessage', { message, roomName: this.roomName });
    }
    ngOnDestroy(): void {
        if (this.socketService.isSocketAlive()) this.socketService.disconnect();
    }
}
