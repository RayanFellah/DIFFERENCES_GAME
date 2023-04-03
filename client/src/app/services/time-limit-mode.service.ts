import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Vec2 } from '@app/interfaces/vec2';
import { GameEvents } from '@common/game-events';
import { PlayRoom } from '@common/play-room';
import { Player } from '@common/player';
import { BLINK_DURATION, RGBA_LENGTH } from 'src/constants';
import { AudioService } from './audio.service';
import { CanvasHelperService } from './canvas-helper.service';
import { SocketClientService } from './socket-client/socket-client.service';

@Injectable({
    providedIn: 'root',
})
export class TimeLimitModeService {
    sheet: string;
    player: Player;
    playRoom: PlayRoom;
    timeLimit: number;
    timeBonus: number;
    hintsLeft: number = 3;
    clickIgnored = false;
    originalImageData: ImageData;
    modifiedImageData: ImageData;
    audio: AudioService;
    isBlinking: boolean;
    differencesFound: number = 0;
    currentClick: MouseEvent;

    constructor(
        private socketService: SocketClientService,
        private activeRoute: ActivatedRoute,
        private leftCanvas: CanvasHelperService,
        private rightCanvas: CanvasHelperService,
    ) {
        this.audio = new AudioService();
        this.socketService.connect();
        const playerName = this.activeRoute.snapshot.paramMap.get('name');
        this.sheet = this.activeRoute.snapshot.paramMap.get('id') as string;
        this.player = {
            name: playerName as string,
            socketId: this.socketService.socket.id,
            differencesFound: 0,
        };
        this.handleResponses();
    }

    start() {}

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

    getImagesFromSheet() {
        this.socketService.send(GameEvents.RequestImages, this.sheet);
    }

    requestSecondPlayer() {
        const data = {
            player: this.player,
            room: this.playRoom,
        };
        this.socketService.send(GameEvents.RequestSecondPlayer, data);
    }

    handleResponses() {
        this.socketService.on(GameEvents.ClickValidated, (res: { coords: Vec2[]; player: Player; diffsLeft: number }) => {
            this.handleClick(this.currentClick, res.coords, res.player.socketId);
            this.player.differencesFound = res.diffsLeft;
        });

        this.socketService.on(GameEvents.ImagesServed, (data: { left: Blob; right: Blob }) => {
            this.leftCanvas.drawImageOnCanvas(data.left);
            this.rightCanvas.drawImageOnCanvas(data.right);
        });

        this.socketService.on(GameEvents.WaitingRoomCreated, () => {
            // openWaitingDialog;
            // dire en attente d'un deuxieme joueur;
        });

        this.socketService.on(GameEvents.CoopGameConfirmed, () => {
            this.socketService.send(GameEvents.playerReady, this.player);
        });
    }
    private createGame(event: string) {
        const data = {
            player: this.player,
            sheet: this.sheet,
        };
        this.socketService.send(event, data);
    }

    private handleClick(event: MouseEvent, diff: Vec2[] | undefined, player: string) {
        if (!event) return;
        const canvasClicked = event.target as HTMLCanvasElement;
        const canvas: CanvasHelperService = canvasClicked === this.leftCanvas.getCanvas() ? this.leftCanvas : this.rightCanvas;
        if (diff) {
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
}
