import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Vec2 } from '@app/interfaces/vec2';
import { GameConstants } from '@common/game-constants';
import { GameEvents } from '@common/game-events';
import { LimitedTimeRoom } from '@common/limited-time-room';
import { Player } from '@common/player';
import { Subject, takeUntil } from 'rxjs';
import { AudioService } from './audio.service';
import { CanvasFormatterService } from './canvas-formatter.service';
import { DialogService } from './dialog-service/dialog.service';
import { GameStateService } from './game-state/game-state.service';
import { HintsService } from './hints.service';
import { SocketClientService } from './socket-client/socket-client.service';
import { TimerReplayService } from './timer-replay/timer-replay.service';

const TIME = 60;
const BONUS = 7;
@Injectable({
    providedIn: 'root',
})
export class TimeLimitModeService {
    player: Player;
    playRoom: LimitedTimeRoom;
    timeLimit: number = TIME;
    timeBonus: number = BONUS;
    hintsLeft: number = 3;
    clickIgnored = false;
    leftBuffer: Buffer | null;
    rightBuffer: Buffer | null;
    differencesFound: number = 0;
    currentClick: MouseEvent;
    isGameOver: boolean = false;
    leftCanvasRef: HTMLCanvasElement;
    rightCanvasRef: HTMLCanvasElement;
    isPlayer2Online: boolean = false;
    allyGaveUp: boolean = false;
    private _constants: GameConstants;
    private unsubscribe$ = new Subject<void>();
    // eslint-disable-next-line max-params
    constructor(
        private router: Router,
        private socketClientService: SocketClientService,
        private dialogService: DialogService,
        private gameStateService: GameStateService,
        private canvasFormatter: CanvasFormatterService,
        private audio: AudioService,
        private hintService: HintsService,
        private timer: TimerReplayService,
    ) {
        this.handleResponses();

        this.timer.timeDone$.subscribe((res) => {
            if (res) this.timeOutProtocol();
        });
    }
    get constants() {
        return this._constants;
    }
    set constants(constants: GameConstants) {
        this._constants = constants;
    }
    reset() {
        this.timeLimit = TIME;
        this.timeBonus = BONUS;
        this.hintsLeft = 3;
        this.clickIgnored = false;
        this.differencesFound = 0;
        this.isGameOver = false;
        this.isPlayer2Online = false;
        this.leftBuffer = null;
        this.rightBuffer = null;
    }

    logPlayer(player: string) {
        this.player = {
            socketId: this.socketClientService.socketId,
            name: player,
            differencesFound: 0,
        };
        this.gameStateService.isGameInitialized = true;
    }
    setConstants(limit: number, bonus: number) {
        this.timeLimit = limit;
        this.timeBonus = bonus;
    }

    sendClick(event: MouseEvent) {
        if (this.clickIgnored || this.isGameOver) return;
        this.currentClick = event;
        const data = {
            playerName: this.player.name,
            roomName: this.playRoom.roomName,
            click: { target: (this.currentClick.target as HTMLCanvasElement).id, x: this.currentClick.offsetX, y: this.currentClick.offsetY },
        };

        this.socketClientService.send(GameEvents.ClickTL, data);
    }
    createSolo() {
        this.createGame(GameEvents.CreateLimitedTimeSolo);
    }

    isTimeDone() {
        return this.timeLimit <= 0;
    }

    createCoop() {
        this.createGame(GameEvents.CreateLimitedTimeCoop);
    }

    bindCanvasRefs(left: HTMLCanvasElement, right: HTMLCanvasElement) {
        this.leftCanvasRef = left;
        this.rightCanvasRef = right;
    }

    drawOnCanvas() {
        this.canvasFormatter.drawImageOnCanvas(
            new Blob([this.leftBuffer as Buffer], { type: 'image/bmp' }),
            new Image(),
            this.leftCanvasRef.getContext('2d') as CanvasRenderingContext2D,
        );
        this.canvasFormatter.drawImageOnCanvas(
            new Blob([this.rightBuffer as Buffer], { type: 'image/bmp' }),
            new Image(),
            this.rightCanvasRef.getContext('2d') as CanvasRenderingContext2D,
        );
    }

    startTimer() {
        this.socketClientService
            .on<void>(GameEvents.Clock)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => {
                if (!this.isGameOver) this.updateTimer();
            });
    }

    handleResponses() {
        // Click Validated event
        this.socketClientService
            .on<{ diffFound: Vec2[]; player: Player; room: LimitedTimeRoom; left: Buffer; right: Buffer; click: unknown }>(GameEvents.ClickValidated)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((res) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                this.handleClick(res.click, res.diffFound, res.player.socketId);
                this.playRoom = res.room;
                if (res.left && res.right) {
                    this.leftBuffer = res.left;
                    this.rightBuffer = res.right;
                    this.drawOnCanvas();
                }
            });

        // Game Over event
        this.socketClientService
            .on<void>(GameEvents.GameOver)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => {
                const DELAY = 50;
                this.isGameOver = true;
                setTimeout(() => {
                    this.timer.stopTimer();
                    this.audio.playWonSound();
                }, DELAY);
            });

        // Second Player Joined event
        this.socketClientService
            .on<{ room: LimitedTimeRoom; left: Buffer; right: Buffer }>(GameEvents.SecondPlayerJoined)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((res) => {
                this.isPlayer2Online = true;
                this.playRoom = res.room;
                this.leftBuffer = res.left;
                this.rightBuffer = res.right;
                this.dialogService.emitCoopLunch();
                this.router.navigate(['/limited-time']);
                this.startTimer();
            });

        // Limited Time Room Created event
        this.socketClientService
            .on<{ room: LimitedTimeRoom; left: Buffer; right: Buffer }>(GameEvents.LimitedTimeRoomCreated)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((res) => {
                this.playRoom = res.room;
                this.leftBuffer = res.left;
                this.rightBuffer = res.right;
                this.router.navigate(['/limited-time']);
                this.startTimer();
                this.hintService.differences = this.hintService.fetchCoords(this.playRoom.currentDifferences);
            });

        // Player Left event
        this.socketClientService
            .on<void>(GameEvents.playerLeft)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => {
                this.isPlayer2Online = false;
                this.hintService.differences = this.hintService.fetchCoords(this.playRoom.currentDifferences);
                this.allyGaveUp = true;
            });
    }

    cancelGame() {
        this.socketClientService.send(GameEvents.CancelGame);
    }
    cleanup() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    private createGame(event: string) {
        const data = {
            player: this.player,
            timeBonus: this.timeBonus,
            timeLimit: this.timeLimit,
            hintsLeft: this.hintsLeft,
        };
        this.socketClientService.send(event, data);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private handleClick(event: any, diff: Vec2[] | undefined, player: string) {
        if (!event) return;

        const ctx =
            event.target === this.leftCanvasRef.id
                ? (this.leftCanvasRef.getContext('2d') as CanvasRenderingContext2D)
                : (this.rightCanvasRef.getContext('2d') as CanvasRenderingContext2D);
        if (diff) {
            this.timer.addTimerBonus(this.constants);
            this.hintService.differences = this.hintService.fetchCoords(this.playRoom.currentDifferences);
            this.timeLimit += this.timeBonus;
            if (player === this.socketClientService.socketId) {
                this.audio.playSuccessSound();
            }

            this.differencesFound++;
            return diff;
        } else if (player === this.socketClientService.socketId) {
            this.ignoreClicks();
            this.canvasFormatter.displayErrorMessage(event, ctx);
            this.audio.playFailSound();
        }
        return undefined;
    }

    private ignoreClicks() {
        const time = 1000;
        this.clickIgnored = true;
        setTimeout(() => {
            this.clickIgnored = false;
        }, time);
    }

    private updateTimer() {
        if (this.timeLimit > 0) {
            this.timeLimit = this.timeLimit - 1;
        }
    }
    private timeOutProtocol() {
        this.player.socketId = this.socketClientService.socketId;
        this.isGameOver = true;
        this.socketClientService.send(GameEvents.TimeOut, { roomName: this.playRoom.roomName, player: this.player, allyGaveUp: this.allyGaveUp });
    }
}
