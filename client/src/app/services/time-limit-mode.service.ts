import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Vec2 } from '@app/interfaces/vec2';
import { GameEvents } from '@common/game-events';
import { LimitedTimeRoom } from '@common/limited-time-room';
import { Player } from '@common/player';
import { CanvasFormatterService } from './canvas-formatter.service';
import { DialogService } from './dialog-service/dialog.service';
import { GameStateService } from './game-state/game-state.service';
import { SocketClientService } from './socket-client/socket-client.service';

const TIME = 60;
const BONUS = 7;
@Injectable({
    providedIn: 'root',
})
export class TimeLimitModeService implements OnDestroy {
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

    // eslint-disable-next-line max-params
    constructor(
        private router: Router,
        private socketService: SocketClientService,
        private dialogService: DialogService,
        private gameStateService: GameStateService,
        private canvasFormatter: CanvasFormatterService, // private audio: AudioService, // private hintService: HintsService,
    ) {}
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
        this.socketService.connect();
        this.handleResponses();
        this.player = {
            socketId: this.socketService.socket.id,
            name: player,
            differencesFound: 0,
        };
        this.gameStateService.isGameInitialized = true;
    }
    setConstants(limit: number, bonus: number) {
        this.timeLimit = limit;
        this.timeBonus = bonus;
    }

    useHint() {
        if (this.hintsLeft > 0) {
            this.hintsLeft--;
            return true;
        }
        return false;
    }
    sendClick(event: MouseEvent) {
        if (this.clickIgnored || this.isGameOver) return;
        this.currentClick = event;
        const data = {
            playerName: this.player.name,
            x: event.offsetX,
            y: event.offsetY,
            roomName: this.playRoom.roomName,
        };

        this.socketService.send(GameEvents.ClickTL, data);
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
        this.socketService.on(GameEvents.Clock, () => {
            if (!this.isGameOver) this.updateTimer();
        });
    }

    handleResponses() {
        this.socketService.on(
            GameEvents.ClickValidated,
            async (res: { diffFound: Vec2[]; player: Player; room: LimitedTimeRoom; left: Buffer; right: Buffer }) => {
                this.handleClick(this.currentClick, res.diffFound, res.player.socketId);
                this.playRoom = res.room;
                if (res.left && res.right) {
                    this.leftBuffer = res.left;
                    this.rightBuffer = res.right;
                    this.drawOnCanvas();
                }
            },
        );

        this.socketService.on(GameEvents.GameOver, () => {
            const DELAY = 50;
            this.isGameOver = true;
            setTimeout(() => {
                // this.audio.playWonSound();
            }, DELAY);
        });

        this.socketService.on(GameEvents.SecondPlayerJoined, (res: { room: LimitedTimeRoom; left: Buffer; right: Buffer }) => {
            this.isPlayer2Online = true;
            this.playRoom = res.room;
            this.leftBuffer = res.left;
            this.rightBuffer = res.right;
            this.dialogService.emitCoopLunch();
            this.router.navigate(['/limited-time']);
            this.startTimer();
        });

        this.socketService.on(GameEvents.LimitedTimeRoomCreated, (res: { room: LimitedTimeRoom; left: Buffer; right: Buffer }) => {
            this.playRoom = res.room;
            this.leftBuffer = res.left;
            this.rightBuffer = res.right;
            this.router.navigate(['/limited-time']);
            this.startTimer();
        });

        this.socketService.on(GameEvents.playerLeft, (/*    player: Player*/) => {
            this.isPlayer2Online = false;
        });
    }
    disconnect() {
        this.socketService.disconnect();
    }
    ngOnDestroy(): void {
        this.disconnect();
    }
    private createGame(event: string) {
        const data = {
            player: this.player,
            timeBonus: this.timeBonus,
            timeLimit: this.timeLimit,
            hintsLeft: this.hintsLeft,
        };
        this.socketService.send(event, data);
    }

    private handleClick(event: MouseEvent, diff: Vec2[] | undefined, player: string) {
        if (!event) return;
        const canvasClicked = event.target as HTMLCanvasElement;
        const ctx =
            canvasClicked === this.leftCanvasRef
                ? (this.leftCanvasRef.getContext('2d') as CanvasRenderingContext2D)
                : (this.rightCanvasRef.getContext('2d') as CanvasRenderingContext2D);

        if (diff) {
            this.timeLimit += this.timeBonus;
            if (player === this.socketService.socket.id) {
                // this.audio.playSuccessSound();
            }

            this.differencesFound++;
            return diff;
        } else if (player === this.socketService.socket.id) {
            this.ignoreClicks();
            this.canvasFormatter.displayErrorMessage(event, ctx);
            // this.audio.playFailSound();
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
}
