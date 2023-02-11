import { Injectable } from '@angular/core';
import { CanvasTestHelper } from './canvas-test-helper';
import { Sheet } from '@app/interfaces/sheet';
import { Coord } from '@app/interfaces/coord';
import { AudioService } from './Audio/audio.service';
import { HttpService } from './http.service';
import { TimerService } from './timer.service';
@Injectable({
    providedIn: 'root',
})
export class GameLogicService {
    // private differences = Promise.resolve(getAllClusters(0, path1, path2));
    differencesFound: number = 0;
    differences: number;
    timer: TimerService;
    audio: AudioService;
    diff: Coord[];
    originalImage: File;
    modifiedImage: File;
    sheet: Sheet;
    constructor(private canvas: CanvasTestHelper, private canvas2: CanvasTestHelper, private http: HttpService) {
        // this.differences.then((res) => {
        //     this.differencesLeft = res.length
        // });
        this.timer = new TimerService();
        this.audio = new AudioService();
        this.http.start().subscribe((res) => {
            this.sheet = res.gameSheet;
            this.differences = res.numberOfdiffs;
        });
    }
    start() {
        this.http.getImages(this.sheet.sheetId).original.subscribe((res) => {
            this.originalImage = res;
        });

        this.http.getImages(this.sheet.sheetId).modified.subscribe((res) => {
            this.modifiedImage = res;
        });
        this.canvas.drawImageOnCanvas(this.originalImage);
        this.canvas2.drawImageOnCanvas(this.modifiedImage);
        this.timer.start();
    }

    async handleClick(event: MouseEvent) {
        // const diff = hasFound( { posX: event.offsetX, posY: event.offsetY } , await this.differences);
        // Waiting for the http return value
        const canvasClicked = event.target as HTMLCanvasElement;
        const canvas: CanvasTestHelper = canvasClicked === this.canvas.canvasRef ? this.canvas : this.canvas2;
        this.http.playerClick('RiTu6ICz8b', event.offsetX, event.offsetY).subscribe((res) => {
            this.diff = res;
        });
        if (this.diff) {
            this.canvas.updateImage(this.diff);
            this.canvas2.updateImage(this.diff);
            this.audio.playSuccessSound();
            this.differences++;
            if (this.differencesFound === this.differences) {
                this.timer.stop();
                console.log('Vous avez fini le jeu en: ' + this.timer.getMinutes() + ':' + this.timer.getSeconds());
                this.timer.reset();
            }
            return this.diff;
        } else {
            this.audio.playFailSound();
            const temp: ImageData = canvas.context?.getImageData(0, 0, this.canvas.width, this.canvas.height);
            canvas.context?.fillText('ERROR', event.offsetX, event.offsetY);
            setTimeout(() => {
                canvas.context?.putImageData(temp, 0, 0);
            }, 1000);
        }
    }

    async game() {
        this.start();
        this.canvas.canvasRef.addEventListener('mousedown', async (event) => {
            await this.handleClick(event);
        });
        this.canvas2.canvasRef.addEventListener('mousedown', async (event) => {
            await this.handleClick(event);
        });
    }
}
