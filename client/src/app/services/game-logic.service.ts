/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SafeUrl } from '@angular/platform-browser';
import { DialaogGameOverComponent } from '@app/components/dialaog-game-over/dialaog-game-over.component';
import { Coord } from '@app/interfaces/coord';
import { Sheet } from '@app/interfaces/sheet';
import { AudioService } from './Audio/audio.service';
import { CanvasTestHelper } from './canvas-test-helper';
import { DifferencesFoundService } from './differences-found.service';
import { HttpService } from './http.service';
import { TimerService } from './timer.service';

@Injectable({
    providedIn: 'root',
})
export class GameLogicService {
    differencesFound: number = 0;
    numberDifferences: number;
    timer: TimerService;
    audio: AudioService;
    diff: Coord[];
    originalImage: SafeUrl;
    modifiedImage: SafeUrl;
    sheet: Sheet;
    difficulty: string;
    clickEnabled = true;
    foundDifferences: Coord[][] = [];
    constructor(
        private leftCanvas: CanvasTestHelper,
        private rightCanvas: CanvasTestHelper,
        private readonly http: HttpService,
        private differencesFoundService: DifferencesFoundService,
        private dialog: MatDialog,
    ) {
        this.timer = new TimerService();
        this.audio = new AudioService();
        this.http.getCurrentGame().subscribe((res) => {
            this.sheet = res;
            this.start();
        });
    }

    start() {
        this.http.getImage(this.sheet, true).subscribe((res) => {
            const blob = new Blob([res], { type: 'image/bmp' });
            this.leftCanvas.drawImageOnCanvas(blob);
        });
        this.http.getImage(this.sheet, false).subscribe((res) => {
            const blob = new Blob([res], { type: 'image/bmp' });
            this.rightCanvas.drawImageOnCanvas(blob);
        });
        this.http.getDifferences().subscribe((res) => {
            this.numberDifferences = res.numberDifferences;
            this.difficulty = res.difficulty;
            this.differencesFoundService.setNumberOfDifferences(this.numberDifferences);
        });
        this.timer.start();
    }
    async sendCLick(event: MouseEvent) {
        this.http.playerClick(this.sheet.sheetId, event.offsetX, event.offsetY).subscribe((res) => {
            if (this.foundDifferences.find((diff) => JSON.stringify(diff) === JSON.stringify(res))) return;
            this.diff = res;
            this.foundDifferences.push(res);
            this.handleClick(event, this.diff);
        });
    }
    makeBlink(diff: Coord[]) {
        if (this.leftCanvas.context) {
            const tempImageData = this.leftCanvas.context.getImageData(0, 0, this.leftCanvas.width, this.leftCanvas.height);
            const intervalId = setInterval(() => {
                this.leftCanvas.updateImage(diff);
                this.rightCanvas.updateImage(diff);
            }, 30);

            setTimeout(() => {
                this.leftCanvas.context!.putImageData(tempImageData, 0, 0);
                const imagedata2 = this.rightCanvas.context!.getImageData(0, 0, this.rightCanvas.width, this.rightCanvas.height);
                for (const coord of diff) {
                    const index = (coord.posX + coord.posY * this.rightCanvas.width) * 4;
                    imagedata2.data[index + 0] = tempImageData.data[index + 0]; // R (rouge)
                    imagedata2.data[index + 1] = tempImageData.data[index + 1]; // G (vert)
                    imagedata2.data[index + 2] = tempImageData.data[index + 2]; // B (bleu)
                    imagedata2.data[index + 3] = tempImageData.data[index + 3]; // A (alpha)
                }
                this.rightCanvas.context!.putImageData(imagedata2, 0, 0);
                clearInterval(intervalId);
            }, 800);
        }
    }

    async handleClick(event: MouseEvent, diff: Coord[]) {
        if (!this.clickEnabled) {
            return;
        }
        const canvasClicked = event.target as HTMLCanvasElement;
        const canvas: CanvasTestHelper = canvasClicked === this.leftCanvas.get() ? this.leftCanvas : this.rightCanvas;
        if (diff) {
            this.makeBlink(diff);
            this.audio.playSuccessSound();
            this.differencesFound++;
            this.differencesFoundService.setAttribute(this.differencesFound);
            console.log('a' + this.numberDifferences);
            if (this.differencesFound === this.numberDifferences) {
                this.endGame();
                this.showDialog();
            }
            return diff;
        } else {
            this.clickEnabled = false;
            this.audio.playFailSound();
            canvas.displayErrorMessage(event);
            setTimeout(() => {
                this.clickEnabled = true;
            }, 1000);
            return undefined;
        }
    }

    endGame() {
        this.clickEnabled = false;
        this.differencesFound = 0;
        this.timer.stop();
        this.timer.reset();
    }
    private showDialog() {
        const dialogRef = this.dialog.open(DialaogGameOverComponent);

        dialogRef.afterClosed().subscribe(() => {});
    }
}
