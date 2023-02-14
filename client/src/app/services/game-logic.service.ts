/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { Coord } from '@app/interfaces/coord';
import { Sheet } from '@app/interfaces/sheet';
import { AudioService } from './Audio/audio.service';
import { CanvasTestHelper } from './canvas-test-helper';
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
    constructor(private leftCanvas: CanvasTestHelper, private rightCanvas: CanvasTestHelper, private readonly http: HttpService) {
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
        });
        this.timer.start();
    }
    async sendCLick(event: MouseEvent) {
        this.http.playerClick(this.sheet.sheetId, event.offsetX, event.offsetY).subscribe((res) => {
            this.diff = res;
            this.handleClick(event, this.diff);
        });
    }

    makeBlink(diff: Coord[]) {
        if (this.leftCanvas.context) {
            const tempImageData = this.leftCanvas.context.getImageData(0, 0, this.leftCanvas.width, this.leftCanvas.height);
            const intervalId = setInterval(() => {
                this.leftCanvas.updateImage(diff);
                this.rightCanvas.updateImage(diff);
            }, 50);

            setTimeout(() => {
                this.leftCanvas.context!.putImageData(tempImageData, 0, 0);
                const imagedata2 = this.rightCanvas.context!.getImageData(0, 0, this.rightCanvas.width, this.rightCanvas.height);
                for (const coord of diff) {
                    const index = (coord.posX + coord.posY * this.rightCanvas.width) * 4; // calculer l'index du pixel à partir de ses coordonnées
                    imagedata2.data[index + 0] = tempImageData.data[index + 0]; // R (rouge)
                    imagedata2.data[index + 1] = tempImageData.data[index + 1]; // G (vert)
                    imagedata2.data[index + 2] = tempImageData.data[index + 2]; // B (bleu)
                    imagedata2.data[index + 3] = tempImageData.data[index + 3]; // A (alpha)
                }
                this.rightCanvas.context!.putImageData(imagedata2, 0, 0);
                clearInterval(intervalId);
            }, 1000);
        }
    }

    async handleClick(event: MouseEvent, diff: Coord[]) {
        const canvasClicked = event.target as HTMLCanvasElement;
        const canvas: CanvasTestHelper = canvasClicked === this.leftCanvas.get() ? this.leftCanvas : this.rightCanvas;
        console.log(diff);
        if (diff) {
            console.log('oui');
            this.makeBlink(diff);
            this.audio.playSuccessSound();
            this.differencesFound++;
            if (this.differencesFound === this.numberDifferences) {
                this.endGame();
                console.log('Vous avez fini le jeu en: ' + this.timer.getMinutes() + ':' + this.timer.getSeconds());
                // this.timer.reset();
            }
            return diff;
        } else {
            // this.audio.playFailSound();
            canvas.displayErrorMessage(event);
            return undefined;
        }
    }

    endGame() {
        this.timer.stop();
        this.timer.reset();
    }
}
