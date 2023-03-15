/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { Vec2 } from '@app/interfaces/vec2';
import { Sheet } from '@common/sheet';
import { Subject } from 'rxjs';
import { RGBA_LENGTH } from 'src/constants';
import { AudioService } from './audio.service';
import { CanvasHelperService } from './canvas-helper.service';
import { CheatModeService } from './cheat-mode.service';
import { DifferencesFoundService } from './differences-found.service';
import { GameHttpService } from './game-http.service';
import { GameSelectorService } from './game-selector.service';
import { ImageHttpService } from './image-http.service';

@Injectable({
    providedIn: 'root',
})
export class GameLogicService {
    clicks$: Subject<MouseEvent> = new Subject();
    isBlinking = false;
    differencesFound: number = 0;
    numberDifferences: number;
    audio: AudioService;
    diff: Vec2[];
    originalImage: SafeUrl;
    modifiedImage: SafeUrl;
    originalImageData: ImageData;
    modifiedImageData: ImageData;
    sheet: Sheet;
    difficulty: string;
    clickEnabled = true;
    foundDifferences: Vec2[][] = [];
    allowed = true;
    result: boolean = false;

    constructor(
        private leftCanvas: CanvasHelperService,
        private rightCanvas: CanvasHelperService,
        private readonly gameHttp: GameHttpService, // private differencesFoundService: DifferencesFoundService, // private dialog: MatDialog,
        private readonly imageHttp: ImageHttpService,
        private readonly currentGame: GameSelectorService,
        private differencesFoundService: DifferencesFoundService,
        private cheatMode: CheatModeService,
    ) {
        this.audio = new AudioService();
    }
    start() {
        this.sheet = this.currentGame.currentGame;
        this.imageHttp.getImage(this.sheet.originalImagePath).subscribe((res) => {
            const blob = new Blob([res], { type: 'image/bmp' });
            this.leftCanvas.drawImageOnCanvas(blob);
        });
        this.imageHttp.getImage(this.sheet.modifiedImagePath).subscribe((res) => {
            const blob = new Blob([res], { type: 'image/bmp' });
            this.rightCanvas.drawImageOnCanvas(blob);
        });

        this.numberDifferences = this.sheet.differences;
        this.differencesFoundService.setNumberOfDifferences(this.numberDifferences);
        this.difficulty = this.sheet.difficulty;
        this.differencesFoundService.setNumberOfDifferences(this.numberDifferences);
    }
    async sendCLick(event: MouseEvent) {
        return new Promise<boolean>((resolve, reject) => {
            if (this.allowed) {
                this.gameHttp.playerClick(this.sheet._id, event.offsetX, event.offsetY).subscribe((res) => {
                    if (this.foundDifferences.find((diff) => JSON.stringify(diff) === JSON.stringify(res)) || !res) {
                        this.handleClick(event, undefined);
                        this.wait();
                        this.result = false;
                        resolve(this.result);
                    } else if (res) {
                        this.differencesFoundService.setNumberOfDifferences(this.differencesFound);
                        this.diff = res;
                        this.foundDifferences.push(res);
                        this.handleClick(event, this.diff);
                        this.result = true;
                        resolve(this.result);
                    }
                });
            } else {
                resolve(false);
            }
        });
    }

    makeBlink(diff: Vec2[]) {
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
            }, 400);
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
    handleClick(event: MouseEvent, diff: Vec2[] | undefined) {
        const canvasClicked = event.target as HTMLCanvasElement;
        const canvas: CanvasHelperService = canvasClicked === this.leftCanvas.getCanvas() ? this.leftCanvas : this.rightCanvas;
        if (diff) {
            this.makeBlink(this.diff);
            this.audio.playSuccessSound();
            this.differencesFound++;
            this.differencesFoundService.setAttribute(this.differencesFound);
            this.cheatMode.removeDifference(diff);
            return diff;
        } else {
            canvas.displayErrorMessage(event);
            this.audio.playFailSound();
            return undefined;
        }
    }
    cheat() {
        this.cheatMode.getDifferences(this.sheet);
        this.cheatMode.cheatBlink(this.leftCanvas, this.rightCanvas, this.originalImageData, this.modifiedImageData);
    }
    private wait() {
        this.allowed = false;
        setTimeout(() => {
            this.allowed = true;
        }, 1000);
    }
}
