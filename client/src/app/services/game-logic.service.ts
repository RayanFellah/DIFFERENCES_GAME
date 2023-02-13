import { Injectable } from '@angular/core';
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
    // private differences = Promise.resolve(getAllClusters(0, path1, path2));
    differencesFound: number = 0;
    differences: number;
    timer: TimerService;
    audio: AudioService;
    diff: Coord[];
    originalImage: string;
    modifiedImage: string;
    sheet: Sheet;

    constructor(private canvas1: CanvasTestHelper, private canvas2: CanvasTestHelper, private readonly http: HttpService) {
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

    setCanvasHelper1(canvas: CanvasTestHelper) {
        this.canvas1 = canvas;
    }

    setCanvasHelper2(canvas: CanvasTestHelper) {
        this.canvas2 = canvas;
    }
    start() {
        console.log('ici');
        this.http.getImages(this.sheet.sheetId).original.subscribe((res) => {
            this.originalImage = res;
        });

        this.canvas1.drawImageOnCanvas(this.originalImage);
        this.canvas2.drawImageOnCanvas(this.modifiedImage);
        this.timer.start();
    }

    async handleClick(event: MouseEvent) {
        // const diff = hasFound( { posX: event.offsetX, posY: event.offsetY } , await this.differences);
        // Waiting for the http return value
        const canvasClicked = event.target as HTMLCanvasElement;
        const canvas: CanvasTestHelper = canvasClicked === this.canvas.canvasRef ? this.canvas : this.canvas2;
        this.http.playerClick(this.sheet.sheetId, event.offsetX, event.offsetY).subscribe((res) => {
            this.diff = res;
        });
        if (this.diff) {
            this.canvas1.updateImage(this.diff);
            this.canvas2.updateImage(this.diff);
            this.audio.playSuccessSound();
            this.differences++;
            if (this.differencesFound === this.differences) {
                this.timer.stop();
                console.log('Vous avez fini le jeu en: ' + this.timer.getMinutes() + ':' + this.timer.getSeconds());
                // this.timer.reset();
            }
            return this.diff;
        } else {
            this.audio.playFailSound();
            const temp: ImageData | undefined = canvas.context?.getImageData(0, 0, this.canvas.width, this.canvas.height);
            canvas.context?.fillText('ERROR', event.offsetX, event.offsetY);
            setTimeout(() => {
                if (temp) {
                    canvas.context?.putImageData(temp, 0, 0);
                }
            }, 1000);
            return undefined;
        }
    }

    async game() {
        this.start();
        this.canvas1.canvasRef.addEventListener('mousedown', async (event) => {
            await this.handleClick(event);
        });
        this.canvas2.canvasRef.addEventListener('mousedown', async (event) => {
            await this.handleClick(event);
        });
    }
}
