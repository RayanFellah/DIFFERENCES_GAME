/* eslint-disable max-params */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Vec2 } from '@app/interfaces/vec2';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { Player } from '@common/player';
import { Sheet } from '@common/sheet';
import { BLINK_DURATION, CHEAT_BLINK_INTERVAL, RGBA_LENGTH } from 'src/constants';
import { AudioService } from './audio.service';
import { CanvasHelperService } from './canvas-helper.service';
import { CheatModeService } from './cheat-mode.service';
import { GameHttpService } from './game-http.service';
import { GameReplayService } from './game-replay/game-replay.service';
import { HintsService } from './hints.service';
import { ImageHttpService } from './image-http.service';
import { SheetHttpService } from './sheet-http.service';
@Injectable({
    providedIn: 'root',
})
export class GameLogicService {
    isBlinking = false;
    audio: AudioService;
    diff: Vec2[];
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
    differences: Vec2[][];
    isReplay = false;

    constructor(
        private leftCanvas: CanvasHelperService,
        private rightCanvas: CanvasHelperService,
        private readonly imageHttp: ImageHttpService,
        public activatedRoute: ActivatedRoute,
        private sheetHttp: SheetHttpService,
        private socketService: SocketClientService,
        private cheatMode: CheatModeService,
        private hintService: HintsService,
        private gameReplayService: GameReplayService,
        private gameHttp: GameHttpService,
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
                    if (this.socketService.isSocketAlive()) this.handleResponses();
                    this.playRoom = this.activatedRoute.snapshot.paramMap.get('roomId') as string;
                    this.cheatMode.getDifferences(this.sheet);
                    this.gameHttp.getAllDifferences(this.sheet._id).subscribe((res) => {
                        this.hintService.differences = res;
                    });
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
            roomName: this.playRoom,
            playerName: name,
            click: { x: click.offsetX, y: click.offsetY, target: (click.target as HTMLCanvasElement).id },
        };
        this.socketService.send('click', data);
    }

    handleResponses() {
        this.socketService.on('clickFeedBack', (res: { click: MouseEvent; coords: Vec2[]; player: Player; diffsLeft: number }) => {
            if (!this.gameReplayService.isReplay) {
                this.gameReplayService.events.push({
                    playerName: res.player.name,
                    type: res.coords ? 'found' : 'error',
                    timestamp: Date.now(),
                    data: { click: res.click, coords: res.coords, name: res.player.socketId },
                });
            }
            this.handleClick(res.click, res.coords, res.player.socketId);
        });

        this.socketService.on('gameDone', () => {
            this.gameDoneProtocol();
        });
        this.socketService.on('playerLeft', () => {
            this.gameDoneProtocol();
        });
    }

    makeBlink(diff: Vec2[], delay = BLINK_DURATION) {
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
                }, delay);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleClick(event: any, diff: Vec2[] | undefined, player: string, delay = BLINK_DURATION) {
        if (!event) return;

        const canvas: CanvasHelperService = event.target === this.leftCanvas.getCanvas().id ? this.leftCanvas : this.rightCanvas;

        if (diff) {
            this.makeBlink(diff, delay);
            if (player === this.socketService.socket.id) {
                this.audio.playSuccessSound();
            }

            this.differencesFound++;
            this.cheatMode.removeDifference(diff);
            this.hintService.removeDifference(diff);
            return diff;
        } else if (player === this.socketService.socket.id) {
            this.ignoreClicks();
            canvas.displayErrorMessage2(event, canvas.getCanvas().getContext('2d')!);
            this.audio.playFailSound();
        }
        return undefined;
    }

    cheat(delay = CHEAT_BLINK_INTERVAL) {
        if (this.gameReplayService.isReplay) {
            this.gameReplayService.events.push({
                type: 'cheat',
                timestamp: Date.now(),
                data: {},
            });
        }
        this.cheatMode.getDifferences(this.sheet);
        this.cheatMode.cheatBlink(this.leftCanvas, this.rightCanvas, this.originalImageData, this.modifiedImageData, delay);
    }
    async restart() {
        await this.start();
    }

    private ignoreClicks() {
        const time = 1000;
        this.clickIgnored = true;
        setTimeout(() => {
            this.clickIgnored = false;
        }, time);
    }

    private gameDoneProtocol() {
        this.clickIgnored = true;
        this.isGameDone = true;
    }
}
