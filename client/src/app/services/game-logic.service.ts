/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Vec2 } from '@app/interfaces/vec2';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { Player } from '@common/player';
import { Sheet } from '@common/sheet';
import { Subject } from 'rxjs';
import { BLINK_DURATION, RGBA_LENGTH } from 'src/constants';
import { AudioService } from './audio.service';
import { CanvasHelperService } from './canvas-helper.service';
import { CheatModeService } from './cheat-mode.service';
import { DifferencesFoundService } from './differences-found.service';
import { ImageHttpService } from './image-http.service';
import { SheetHttpService } from './sheet-http.service';

@Injectable({
    providedIn: 'root',
})
export class GameLogicService {
    clicks$: Subject<MouseEvent> = new Subject();
    isBlinking = false;
    audio: AudioService;
    diff: Vec2[];
    originalImage: SafeUrl;
    modifiedImage: SafeUrl;
    originalImageData: ImageData;
    modifiedImageData: ImageData;
    sheet: Sheet;
    difficulty: string;
    result: boolean = false;
    currentClick: MouseEvent;
    playRoom: string;
    numberDifferences: number;
    differencesFound: number;
    clickIgnored: boolean;
    isGameDone = false;

    constructor(
        private leftCanvas: CanvasHelperService,
        private rightCanvas: CanvasHelperService,
        private readonly imageHttp: ImageHttpService,
        private differencesFoundService: DifferencesFoundService,
        public activatedRoute: ActivatedRoute,
        private sheetHttp: SheetHttpService,
        private socketService: SocketClientService,
        private cheatMode: CheatModeService,
    ) {
        this.audio = new AudioService();
    }

    async start() {
        return new Promise<string>((resolve) => {
            const sheetId = this.activatedRoute.snapshot.paramMap.get('id');
            if (sheetId) {
                this.sheetHttp.getSheet(sheetId).subscribe((sheet) => {
                    this.sheet = sheet;
                    this.numberDifferences = this.sheet.differences;

                    this.imageHttp.getImage(this.sheet.originalImagePath).subscribe((res) => {
                        const blob = new Blob([res], { type: 'image/bmp' });
                        this.leftCanvas.drawImageOnCanvas(blob);
                    });
                    this.imageHttp.getImage(this.sheet.modifiedImagePath).subscribe((res) => {
                        const blob = new Blob([res], { type: 'image/bmp' });
                        this.rightCanvas.drawImageOnCanvas(blob);
                    });
                    this.handleResponses();
                    this.playRoom = this.activatedRoute.snapshot.paramMap.get('roomId') as string;
                    this.cheatMode.getDifferences(this.sheet);
                    resolve(this.sheet.difficulty);
                });
            }
        });
    }

    setClick(click: MouseEvent, name: string) {
        if (this.clickIgnored) {
            return;
        }
        this.currentClick = click;
        const data = {
            x: click.offsetX,
            y: click.offsetY,
            roomName: this.playRoom,
            playerName: name,
        };
        this.socketService.send('click', data);
    }

    handleResponses() {
        this.socketService.on('clickFeedBack', (res: { coords: Vec2[]; player: Player; diffsLeft: number }) => {
            if (!res.diffsLeft) {
                this.sendGameDone();
            }
            this.makeBlink(res.coords);
            this.handleClick(this.currentClick, res.coords, res.player.socketId);
        });

        this.socketService.on('roomCreated', (res: string) => {
            this.playRoom = res;
        });

        this.socketService.on('gameDone', (message: string) => {
            this.clickIgnored = true;
            setTimeout(() => {
                alert(message);
            }, BLINK_DURATION);
            this.isGameDone = true;
        });

        this.socketService.on('playerLeft', (message: string) => {
            if (!this.isGameDone) {
                this.sendGameDone();
                alert(message);
            }
        });
    }

    sendGameDone() {
        this.socketService.send('gameDone', this.playRoom);
    }

    makeBlink(diff: Vec2[]) {
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
                    this.leftCanvas.context!.putImageData(this.originalImageData, 0, 0);
                    this.replaceDifference(diff, this.originalImageData);
                    this.isBlinking = false;
                    this.updateImagesInformation();
                    clearInterval(intervalId);
                }, BLINK_DURATION);
            }
        }
    }
    updateImagesInformation() {
        this.originalImageData = this.leftCanvas.getColor();
        this.modifiedImageData = this.rightCanvas.getColor();
    }
    replaceDifference(diff: Vec2[], tempImageData: ImageData) {
        for (const d of diff) {
            const index = (d.posX + d.posY * this.rightCanvas.width) * RGBA_LENGTH;
            this.modifiedImageData.data[index + 0] = tempImageData.data[index + 0];
            this.modifiedImageData.data[index + 1] = tempImageData.data[index + 1];
            this.modifiedImageData.data[index + 2] = tempImageData.data[index + 2];
            this.modifiedImageData.data[index + 3] = tempImageData.data[index + 3];
        }
        this.rightCanvas.context!.putImageData(this.modifiedImageData, 0, 0);
    }
    handleClick(event: MouseEvent, diff: Vec2[] | undefined, player: string) {
        if (!event) return;
        const canvasClicked = event.target as HTMLCanvasElement;
        const canvas: CanvasHelperService = canvasClicked === this.leftCanvas.getCanvas() ? this.leftCanvas : this.rightCanvas;
        if (diff) {
            if (player === this.socketService.socket.id) {
                this.makeBlink(this.diff);
                this.audio.playSuccessSound();
            }
            this.differencesFound++;
            this.differencesFoundService.setAttribute(this.differencesFound);
            this.cheatMode.removeDifference(diff);
            return diff;
        } else if (player === this.socketService.socket.id) {
            this.ignoreClicks();
            canvas.displayErrorMessage(event);
            this.audio.playFailSound();
        }
        return undefined;
    }
    cheat() {
        this.cheatMode.getDifferences(this.sheet);
        this.cheatMode.cheatBlink(this.leftCanvas, this.rightCanvas, this.originalImageData, this.modifiedImageData);
    }

    private ignoreClicks() {
        const time = 1000;
        this.clickIgnored = true;
        setTimeout(() => {
            this.clickIgnored = false;
        }, time);
    }
}
