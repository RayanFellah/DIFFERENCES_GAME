import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Vec2 } from '@app/interfaces/vec2';
import { GameEvents } from '@common/game-events';
import { LimitedTimeRoom } from '@common/limited-time-room';
import { Player } from '@common/player';
import { BLINK_DURATION, RGBA_LENGTH } from 'src/constants';
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

    constructor(
        private router: Router,
        private socketService: SocketClientService,
        private leftCanvas: CanvasHelperService,
        private rightCanvas: CanvasHelperService,
        private dialogService: DialogService,
    ) {
        this.audio = new AudioService();
        this.socketService.connect();
        this.handleResponses();
    }

    setCanvases(leftCanvas: HTMLCanvasElement, rightCanvas: HTMLCanvasElement) {
        this.setCanvas(leftCanvas, 'left').then(() => {
            this.setCanvas(rightCanvas, 'right');
        });

        // this.rightCanvas.setCanvas(rightCanvas);
        // this.rightCanvas.drawImageOnCanvas(new Blob([this.rightBuffer], { type: 'image/bmp' }));
    }

    logPlayer(player: string) {
        this.player = {
            socketId: this.socketService.socket.id,
            name: player,
            differencesFound: 0,
        };
    }

    async setCanvas(canvas: HTMLCanvasElement, side: string) {
        const buffer = side === 'left' ? this.leftBuffer : this.rightBuffer;
        return new Promise<void>(() => {
            this.leftCanvas.setCanvas(canvas);
            this.leftCanvas.drawImageOnCanvas(new Blob([buffer], { type: 'image/bmp' }));
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
        if (this.clickIgnored) return;
        this.currentClick = event;
        const data = {
            playerName: this.player.name,
            x: event.offsetX,
            y: event.offsetY,
            roomName: this.playRoom.roomName,
        };

        this.socketService.send(GameEvents.Click, data);
    }
    createSolo() {
        this.createGame(GameEvents.CreateLimitedTimeSolo);
    }

    createCoop() {
        this.createGame(GameEvents.CreateLimitedTimeCoop);
    }

    joinGame() {
        this.socketService.send(GameEvents.JoinCoop, this.player);
    }

    requestSecondPlayer() {
        const data = {
            player: this.player,
            room: this.playRoom,
        };
        this.socketService.send(GameEvents.RequestSecondPlayer, data);
    }

    drawOnCanvases() {
        this.rightCanvas.drawImageOnCanvas(new Blob([this.rightBuffer], { type: 'image/bmp' }));
        this.leftCanvas.drawImageOnCanvas(new Blob([this.leftBuffer], { type: 'image/bmp' }));
    }

    handleResponses() {
        this.socketService.on(
            GameEvents.ClickValidated,
            (res: { diffFound: Vec2[]; player: Player; room: LimitedTimeRoom; left: Buffer; right: Buffer }) => {
                this.handleClick(this.currentClick, res.diffFound, res.player.socketId);
                this.playRoom = res.room;
                if (res.left && res.right) {
                    this.leftBuffer = res.left;
                    this.rightBuffer = res.right;
                    this.drawOnCanvases();
                }
            },
        );

        this.socketService.on(GameEvents.SecondPlayerJoined, (res: { room: LimitedTimeRoom; left: Buffer; right: Buffer }) => {
            this.playRoom = res.room;
            this.playRoom = res.room;
            this.leftBuffer = res.left;
            this.rightBuffer = res.right;
            this.dialogService.emitCoopLunch();
            this.router.navigate(['/limited-time']);
        });
        // this.socketService.on(GameEvents.Clock, (time: Date) => {
        //     this.updateTimer(time);
        // });
        this.socketService.on(GameEvents.LimitedTimeRoomCreated, (res: { room: LimitedTimeRoom; left: Buffer; right: Buffer }) => {
            this.playRoom = res.room;
            this.leftBuffer = res.left;
            this.rightBuffer = res.right;
            this.router.navigate(['/limited-time']);
        });

        this.socketService.on(GameEvents.playerLeft, (/*    player: Player*/) => {
            this.socketService.disconnect();
        });
    }
    disconnect() {
        this.socketService.disconnect();
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
                this.makeBlink(diff);
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
    private replaceDifference(diff: Vec2[], tempImageData: ImageData) {
        for (const d of diff) {
            const index = (d.posX + d.posY * this.rightCanvas.width) * RGBA_LENGTH;
            this.modifiedImageData.data[index + 0] = tempImageData.data[index + 0];
            this.modifiedImageData.data[index + 1] = tempImageData.data[index + 1];
            this.modifiedImageData.data[index + 2] = tempImageData.data[index + 2];
            this.modifiedImageData.data[index + 3] = tempImageData.data[index + 3];
        }
        this.rightCanvas.context?.putImageData(this.modifiedImageData, 0, 0);
    }
    private ignoreClicks() {
        const time = 1000;
        this.clickIgnored = true;
        setTimeout(() => {
            this.clickIgnored = false;
        }, time);
    }
    private makeBlink(diff: Vec2[]) {
        if (diff) {
            if (this.leftCanvas.context) {
                const leftDiffColor = this.leftCanvas.getColor();
                const rightDiffColor = this.rightCanvas.getColor();
                const intervalId = setInterval(() => {
                    this.isBlinking = true;
                    this.leftCanvas.updateImage(diff, leftDiffColor, rightDiffColor);
                    this.rightCanvas.updateImage(diff, leftDiffColor, rightDiffColor);
                }, 1);

                setTimeout(() => {
                    this.leftCanvas.context?.putImageData(this.originalImageData, 0, 0);
                    this.replaceDifference(diff, this.originalImageData);
                    this.isBlinking = false;
                    this.updateImagesInformation();
                    clearInterval(intervalId);
                }, BLINK_DURATION);
            }
        }
    }
    private updateImagesInformation() {
        this.originalImageData = this.leftCanvas.getColor();
        this.modifiedImageData = this.rightCanvas.getColor();
    }

    // private updateTimer(time: Date) {
    //     this.timeLimit = this.timeLimit - time.getSeconds();
    // }
}
