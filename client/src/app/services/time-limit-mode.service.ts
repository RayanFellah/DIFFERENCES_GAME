import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Vec2 } from '@app/interfaces/vec2';
import { GameEvents } from '@common/game-events';
import { LimitedTimeRoom } from '@common/limited-time-room';
import { Player } from '@common/player';
import { AudioService } from './audio.service';
import { CanvasHelperService } from './canvas-helper.service';
import { DialogService } from './dialog-service/dialog.service';
import { SocketClientService } from './socket-client/socket-client.service';

const TIME = 60;
const BONUS = 7;
@Injectable({
    providedIn: 'root',
})
export class TimeLimitModeService {
    sheet: string;
    player: Player;
    playRoom: LimitedTimeRoom;
    timeLimit: number = TIME;
    timeBonus: number = BONUS;
    hintsLeft: number = 3;
    clickIgnored = false;
    originalImageData: ImageData;
    modifiedImageData: ImageData;
    leftBuffer: Buffer;
    rightBuffer: Buffer;
    audio: AudioService;
    isBlinking: boolean;
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
        private leftCanvas: CanvasHelperService,
        private rightCanvas: CanvasHelperService,
        private dialogService: DialogService,
    ) {
        this.audio = new AudioService();
    }

    logPlayer(player: string) {
        this.socketService.connect();
        const DELAY = 10;
        setTimeout(() => {
            this.handleResponses();
            this.player = {
                socketId: this.socketService.socket.id,
                name: player,
                differencesFound: 0,
            };
        }, DELAY);
    }

    async setCanvas(canvas: HTMLCanvasElement, side: string) {
        const buffer = side === 'left' ? this.leftBuffer : this.rightBuffer;
        if (side === 'left') this.leftCanvasRef = canvas;
        else this.rightCanvasRef = canvas;
        const DELAY = 30;
        return new Promise<void>((resolve) => {
            this.leftCanvas.setCanvas(canvas);
            this.leftCanvas.drawImageOnCanvas(new Blob([buffer], { type: 'image/bmp' }));
            setTimeout(() => resolve(), DELAY);
        });
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

    async drawOnLeftCanvas() {
        const DELAY = 25;
        return new Promise<void>((resolve) => {
            this.leftCanvas.context = this.leftCanvasRef.getContext('2d');
            this.leftCanvas.drawImageOnCanvas(new Blob([this.leftBuffer], { type: 'image/bmp' }));
            setTimeout(() => resolve(), DELAY);
        });
    }

    async drawOnRightCanvas() {
        const DELAY = 25;
        return new Promise<void>((resolve) => {
            this.rightCanvas.context = this.rightCanvasRef.getContext('2d');
            this.rightCanvas.drawImageOnCanvas(new Blob([this.rightBuffer], { type: 'image/bmp' }));
            setTimeout(() => resolve(), DELAY);
        });
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
                    await this.drawOnLeftCanvas();
                    await this.drawOnRightCanvas();
                }
            },
        );

        this.socketService.on(GameEvents.GameOver, () => {
            const DELAY = 50;
            this.isGameOver = true;
            setTimeout(() => {
                this.audio.playWonSound();
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
    updateImagesInformation() {
        this.originalImageData = this.leftCanvas.getColor();
        this.modifiedImageData = this.rightCanvas.getColor();
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
        const canvas: CanvasHelperService = canvasClicked === this.leftCanvas.getCanvas() ? this.leftCanvas : this.rightCanvas;
        if (diff) {
            this.timeLimit += this.timeBonus;
            if (player === this.socketService.socket.id) {
                this.audio.playSuccessSound();
            }

            this.differencesFound++;
            return diff;
        } else if (player === this.socketService.socket.id) {
            this.ignoreClicks();
            canvas.displayErrorMessage(event);
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
}
