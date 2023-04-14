/* eslint-disable max-params */
import { Component, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogComponent } from '@app/components/dialogue/dialog.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { ChatEvents } from '@app/interfaces/chat-events';
import { GameEvents } from '@app/interfaces/game-events';
import { Vec2 } from '@app/interfaces/vec2';
import { DialogService } from '@app/services/dialog-service/dialog.service';
import { GameReplayService } from '@app/services/game-replay/game-replay.service';
import { GameStateService } from '@app/services/game-state/game-state.service';
import { HintsService } from '@app/services/hints.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { ChatMessage } from '@common/chat-message';
import { PlayRoom } from '@common/play-room';
import { Player } from '@common/player';
import { ONE_SECOND, SCRUTATION_DELAY } from 'src/constants';
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
    initialHtml: string;
    count = 0;
    isReplayPaused = false;
    isReplayPlaying = false;
    replaySpeed = 1;
    elapsedTimeInSeconds: number;
    messageTime: string;
    constructor(
        private activatedRoute: ActivatedRoute,
        private socketService: SocketClientService,
        private gameStateService: GameStateService,
        private router: Router,
        private readonly dialog: DialogComponent,
        private readonly dialogService: DialogService,
        private gameReplayService: GameReplayService,
        private hintService: HintsService,
    ) {}

    get hint() {
        return this.hintService;
    }
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
        this.dialogService.shouldReplay$.subscribe(async (shouldReplay: boolean) => {
            if (shouldReplay) {
                await this.resetReplayState();
                await this.replayEvents();
            }
        });
    }

    onDifficultyChange(eventData: string) {
        this.difficulty = eventData;
    }
    handleResponses() {
        this.socketService.on<ChatMessage>(ChatEvents.RoomMessage, (message: ChatMessage) => {
            message.time = this.messageTime;
            if (message.type === 'opponent') message.name = this.opponent.name;
            this.gameReplayService.events.push({
                type: 'chat',
                timestamp: Date.now(),
                data: message,
            });
            this.chatMessages.push(message);
        });
        this.socketService.on<PlayRoom>('roomInfo', (room: PlayRoom) => {
            this.differences = room.numberOfDifferences;
            if (!room.player2) this.person = room.player1;
            else {
                if (room.player1.socketId === this.socketService.socket.id) {
                    this.person = room.player1;
                    this.opponent = room.player2;
                } else {
                    this.person = room.player2;
                    this.opponent = room.player1;
                }
            }
        });
        this.socketService.on<Date>(ChatEvents.Clock, (time: Date) => {
            if (!this.timer) return;
            this.startTimer(time);
        });

        this.socketService.on<Player>('foundDiff', (player: Player) => {
            if (this.person.socketId === player.socketId) this.person = player;
            else this.opponent = player;
        });

        this.socketService.on('gameDone', (winner: string) => {
            if (this.person.name === winner) {
                const congratsMessage = `Félicitations ${winner}! Tu Gagnes :)`;
                this.gameDone(congratsMessage);
            } else {
                const hardLuckMessage = 'Tu as perdu :( , Bonne chance pour la prochaine fois!';
                this.gameDone(hardLuckMessage);
            }
        });
        this.socketService.on<string>('playerLeft', () => {
            const quitMessage = 'Adversaire a quitté, tu Gagnes :)';
            this.gameDone(quitMessage);
        });
    }

    gameDone(message: string) {
        this.timer = false;
        this.dialog.openGameOverDialog(message);
    }
    sendMessage(message: ChatMessage) {
        message.time = this.messageTime;
        this.chatMessages.push(message);
        this.gameReplayService.events.push({
            type: 'chat',
            timestamp: Date.now(),
            data: message,
        });
        this.socketService.send('roomMessage', { message, roomName: this.roomName });
    }
    startTimer(time: Date) {
        const MILLISECONDS = 1000;
        const MINUTES = 60;
        const now = new Date(time);
        this.hintService.applyTimePenalty(now, 5);
        this.messageTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        this.elapsedTimeInSeconds = Math.floor((now.getTime() - this.startTime.getTime()) / MILLISECONDS);
        const minutes = Math.floor(this.elapsedTimeInSeconds / MINUTES);
        const seconds = this.elapsedTimeInSeconds % MINUTES;
        this.formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    setReplaySpeed(speed: number) {
        this.replaySpeed = speed;
    }
    async replayEvents() {
        this.playArea.logic.isReplay = true;
        this.isReplayPlaying = true;
        await new Promise((resolve) => setTimeout(resolve, ONE_SECOND));

        const sortedEvents: GameEvents[] = this.gameReplayService.events.slice().sort((a, b) => a.timestamp - b.timestamp);
        let previousTimestamp = sortedEvents[0].timestamp;

        const processEvent = async (event: GameEvents) => {
            const delay = (event.timestamp - previousTimestamp) / this.replaySpeed;

            await new Promise((resolve) => setTimeout(resolve, delay));

            while (this.isReplayPaused) {
                await new Promise((resolve) => setTimeout(resolve, SCRUTATION_DELAY));
            }

            if (event.type === 'chat') {
                this.chatMessages.push(event.data as ChatMessage);
            }
            if (event.type === 'found') {
                this.playArea.logic.handleClick(event.data.event as MouseEvent, event.data.diff as Vec2[], event.data.player);
                this.person.differencesFound++;
            }
            if (event.type === 'error') {
                this.playArea.logic.handleClick(event.data.event as MouseEvent, event.data.diff as Vec2[], event.data.player);
            } else if (event.type === 'cheat') {
                this.playArea.logic.cheat();
            }

            previousTimestamp = event.timestamp;
        };

        for (const event of sortedEvents) {
            await processEvent(event);
        }
    }
    async restartReplay() {
        if (this.playArea.logic.isReplay) {
            this.isReplayPaused = true;
            await this.resetReplayState().then(() => {
                this.isReplayPaused = false;
                this.replayEvents();
            });
        }
    }
    async resetReplayState() {
        await this.playArea.reset();
        this.person.differencesFound = 0;
        this.formattedTime = '00:00';
        this.chatMessages = [];
    }
    pauseReplay() {
        this.isReplayPaused = true;
    }
    resumeReplay() {
        this.isReplayPaused = false;
    }
    ngOnDestroy(): void {
        this.isReplayPlaying = false;
        this.gameReplayService.events = [];
        if (this.socketService.isSocketAlive()) this.socketService.disconnect();
    }
}
