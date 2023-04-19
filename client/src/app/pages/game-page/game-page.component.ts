/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-params */
import { Component, ElementRef, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogComponent } from '@app/components/dialogue/dialog.component';
import { HintMessageComponent } from '@app/components/hint-message/hint-message.component';
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
import { CHEAT_BLINK_INTERVAL, ONE_SECOND, SCRUTATION_DELAY, THREE_SECONDS } from 'src/constants';
@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    providers: [DialogComponent],
})
export class GamePageComponent implements OnInit, OnDestroy {
    @ViewChild(PlayAreaComponent) playArea: PlayAreaComponent;
    @ViewChild('replayCanvas') replayCanvas: ElementRef<HTMLDivElement>;
    @ViewChild('hintMessage') hintMessage: HintMessageComponent;
    @Output() playerName: string;
    difficulty: string;
    replayMessages: ChatMessage[] = [];
    sheetId: string | null;
    roomName: string;
    differences: number;
    person: Player;
    opponent: Player;
    startTime: Date;
    formattedTime: string;
    timer: boolean;
    initialHtml: string;
    count = 0;

    replaySpeed = 1;
    elapsedTimeInSeconds: number;
    messageTime: string;
    seed: any;
    penaltyTime: string;
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
    get isReplayStarted() {
        return this.gameReplayService.isReplay;
    }
    get isReplayPaused() {
        return this.gameReplayService.isReplayPaused;
    }
    get elapsedTime() {
        return this.gameReplayService.elapsedTime;
    }
    ngOnInit() {
        if (!this.gameStateService.isGameInitialized) {
            this.router.navigate(['/main']);
        } else {
            this.fetchParams();
            this.initTimer();
            if (this.socketService.isSocketAlive()) this.handleResponses();
        }
        this.dialogService.shouldReplay$.subscribe(async (shouldReplay: boolean) => {
            if (shouldReplay) {
                this.seed = this.hintService.secretSeed;
                await this.resetReplayState();
                await this.replayEvents();
            }
        });
    }
    fetchParams() {
        this.playerName = this.activatedRoute.snapshot.paramMap.get('name') as string;
        this.sheetId = this.activatedRoute.snapshot.paramMap.get('id');
        this.roomName = this.activatedRoute.snapshot.paramMap.get('roomId') as string;
        this.penaltyTime = this.activatedRoute.snapshot.paramMap.get('penalty') as string;
    }
    initTimer() {
        this.startTime = new Date();
        this.timer = true;
    }
    stopTimer() {
        this.timer = false;
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
        });
        this.socketService.on('kickOut', () => {
            const kickOutMessage = "La partie n'existe plus 💀 Tu es renvoyé à la page principale.";
            this.gameDone(kickOutMessage);
            const delay = 3000;
            setTimeout(() => {
                this.router.navigate(['/main']);
            }, delay);
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
                const congratsMessage = `Félicitations ${winner}! Tu Gagnes 🥳`;
                this.gameDone(congratsMessage);
            } else {
                const hardLuckMessage = 'Tu as perdu 🤕 Bonne chance pour la prochaine fois!';
                this.gameDone(hardLuckMessage);
            }
        });
        this.socketService.on<string>('playerLeft', () => {
            const quitMessage = 'Adversaire a quitté 🏃‍♂️💨, tu Gagnes!';
            this.gameDone(quitMessage);
        });
    }

    gameDone(message: string) {
        this.timer = false;
        this.dialog.openGameOverDialog({ message, isClassicGame: true });
    }
    sendMessage(message: ChatMessage) {
        message.time = this.messageTime;
        this.gameReplayService.events.push({
            type: 'chat',
            timestamp: Date.now(),
            data: message,
        });
    }
    startTimer(time: Date) {
        const MILLISECONDS = 1000;
        const MINUTES = 60;
        const now = new Date(time);
        this.hintService.applyTimePenalty(parseInt(this.penaltyTime, 10), now);
        this.messageTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        this.elapsedTimeInSeconds = Math.floor((now.getTime() - this.startTime.getTime()) / MILLISECONDS);
        const minutes = Math.floor(this.elapsedTimeInSeconds / MINUTES);
        const seconds = this.elapsedTimeInSeconds % MINUTES;
        this.formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    setReplaySpeed(speed: number) {
        this.replaySpeed = speed;
        this.gameReplayService.speed = speed;
    }
    async replayEvents() {
        this.gameReplayService.isReplay = true;
        await new Promise((resolve) => setTimeout(resolve, ONE_SECOND));

        const sortedEvents: GameEvents[] = this.gameReplayService.events.slice().sort((a, b) => a.timestamp - b.timestamp);
        let previousTimestamp = sortedEvents[0].timestamp;

        const processEvent = async (event: GameEvents) => {
            const delay = (event.timestamp - previousTimestamp) / this.replaySpeed;

            await new Promise((resolve) => setTimeout(resolve, delay));

            while (this.gameReplayService.isReplayPaused) {
                await new Promise((resolve) => setTimeout(resolve, SCRUTATION_DELAY));
            }

            if (event.type === 'chat') {
                this.replayMessages.push(event.data as ChatMessage);
            }
            if (event.type === 'found') {
                if (this.person.name === event.playerName) this.person.differencesFound++;
                if (this.opponent && this.opponent.name === event.playerName) this.opponent.differencesFound++;
                this.playArea.logic.handleClick(event.data.click as MouseEvent, event.data.coords as Vec2[], event.data.name);
            }
            if (event.type === 'error') {
                this.playArea.logic.handleClick(event.data.click as MouseEvent, event.data.coords as Vec2[], event.data.name);
            }
            if (event.type === 'cheat') {
                this.playArea.logic.cheat(CHEAT_BLINK_INTERVAL / this.replaySpeed);
            } else if (event.type === 'hint') {
                if (this.hintService.hintsLeft === 1) {
                    this.gameReplayService.isLastHint = true;
                }
                this.playArea.hint(THREE_SECONDS / this.replaySpeed);
                this.hintService.applyTimePenalty(parseInt(this.penaltyTime, 10));
            }
            previousTimestamp = event.timestamp;
        };

        for (const event of sortedEvents) {
            await processEvent(event);
        }
        this.gameReplayService.stopTimer();
    }
    async restartReplay() {
        if (this.gameReplayService.isReplay) {
            await this.resetReplayState().then(() => {
                this.gameReplayService.isReplayPaused = false;
                this.gameReplayService.isReplay = true;
                this.gameReplayService.isLastHint = false;
                this.replayEvents();
            });
        }
    }
    async resetReplayState() {
        this.replayMessages = [];
        this.fetchParams();
        this.gameReplayService.startTimer();
        this.hintService.seed = this.seed;
        this.hintService.reset();
        this.hintService.getDifferences(this.sheetId as string);
        this.replaySpeed = 1;
        await this.playArea.reset();
        if (this.person) this.person.differencesFound = 0;
        if (this.opponent) this.opponent.differencesFound = 0;
        this.formattedTime = '00:00';
    }
    pauseReplay() {
        this.gameReplayService.stopTimer();
        this.gameReplayService.isReplayPaused = true;
    }
    resumeReplay() {
        this.gameReplayService.startTimer();
        this.gameReplayService.isReplayPaused = false;
        this.gameReplayService.isReplay = true;
    }

    ngOnDestroy(): void {
        this.gameReplayService.resetTimer();
        this.gameReplayService.isReplay = false;
        this.gameReplayService.events = [];
        this.dialogService.emitReplay(false);
        if (this.socketService.isSocketAlive()) this.socketService.disconnect();
    }
}
