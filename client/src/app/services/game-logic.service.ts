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
    async handleClick(event: MouseEvent, diff: Coord[]) {
        const canvasClicked = event.target as HTMLCanvasElement;
        const canvas: CanvasTestHelper = canvasClicked === this.leftCanvas.canvasRef ? this.leftCanvas : this.rightCanvas;
        console.log(diff);
        if (diff) {
            console.log('oui');
            this.leftCanvas.updateImage(diff);
            this.rightCanvas.updateImage(diff);
            // this.audio.playSuccessSound();
            this.differencesFound++;
            if (this.differencesFound === this.numberDifferences) {
                this.timer.stop();
                console.log('Vous avez fini le jeu en: ' + this.timer.getMinutes() + ':' + this.timer.getSeconds());
                // this.timer.reset();
            }
            return diff;
        } else {
            // this.audio.playFailSound();
            const temp: ImageData | undefined = canvas.get()?.getImageData(0, 0, canvas.width, canvas.height);
            canvas.get()?.fillText('ERROR', event.offsetX, event.offsetY);
            setTimeout(() => {
                if (temp) {
                    canvas.get()?.putImageData(temp, 0, 0);
                }
            }, 1000);
            return undefined;
        }
    }
}
