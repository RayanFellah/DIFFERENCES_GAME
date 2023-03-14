/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Vec2 } from '@app/interfaces/vec2';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { Sheet } from '@common/sheet';
import { Subject } from 'rxjs';
import { AudioService } from './audio.service';
import { CanvasHelperService } from './canvas-helper.service';
import { DifferencesFoundService } from './differences-found.service';
import { ImageHttpService } from './image-http.service';
import { SheetHttpService } from './sheet-http.service';

@Injectable({
    providedIn: 'root',
})
export class GameLogicService {
    clicks$: Subject<MouseEvent> = new Subject();
    differencesFound: number = 0;
    numberDifferences: number;
    audio: AudioService;
    diff: Vec2[];
    originalImage: SafeUrl;
    modifiedImage: SafeUrl;
    sheet: Sheet;
    difficulty: string;
    clickEnabled = true;
    foundDifferences: Vec2[][] = [];
    allowed = true;
    result: boolean = false;
    currentClick: MouseEvent;
    playRoom: string;

    constructor(
        private leftCanvas: CanvasHelperService,
        private rightCanvas: CanvasHelperService,
        private readonly imageHttp: ImageHttpService,
        private differencesFoundService: DifferencesFoundService,
        public activatedRoute: ActivatedRoute,
        private sheetHttp: SheetHttpService,
        private socketService: SocketClientService,
    ) {
        this.audio = new AudioService();
    }

    async start(gameType: string, playerName: string) {
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

                    if (gameType === 'solo') {
                        this.createSoloGame(playerName);
                    }
                    this.differencesFoundService.setNumberOfDifferences(this.numberDifferences);
                    this.differencesFoundService.setNumberOfDifferences(this.numberDifferences);
                    resolve(this.sheet.difficulty);
                });
            }
        });
    }

    setClick(click: MouseEvent, name: string) {
        this.currentClick = click;
        const data = {
            x: click.offsetX,
            y: click.offsetY,
            roomName: this.playRoom,
            playerName: name,
        };
        this.socketService.send('click', data);
    }

    createSoloGame(playerName: string) {
        const data = {
            name: playerName,
            sheetId: this.sheet._id,
        };
        this.socketService.send('createSoloGame', data);
    }

    handleResponses() {
        this.socketService.on('found', (coords: Vec2[]) => {
            // this.makeBlink(coords);
            this.handleClick(this.currentClick, coords);
        });

        this.socketService.on('roomCreated', (res: string) => {
            this.playRoom = res;
        });

        this.socketService.on('gameDone', (message: string) => {
            console.log(message);
        });
    }

    makeBlink(diff: Vec2[]) {
        if (this.leftCanvas.context) {
            const tempImageData = this.leftCanvas.context.getImageData(0, 0, this.leftCanvas.width, this.leftCanvas.height);
            const intervalId = setInterval(() => {
                this.leftCanvas.updateImage(diff);
                this.rightCanvas.updateImage(diff);
            }, 30);

            setTimeout(() => {
                this.leftCanvas.context!.putImageData(tempImageData, 0, 0);
                const imagedata2 = this.rightCanvas.context!.getImageData(0, 0, this.rightCanvas.width, this.rightCanvas.height);
                for (const d of diff) {
                    const index = (d.posX + d.posY * this.rightCanvas.width) * 4;
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

    handleClick(event: MouseEvent, diff: Vec2[] | undefined) {
        const canvasClicked = event.target as HTMLCanvasElement;
        const canvas: CanvasHelperService = canvasClicked === this.leftCanvas.get() ? this.leftCanvas : this.rightCanvas;
        if (diff) {
            // this.makeBlink(this.diff);
            this.audio.playSuccessSound();
            this.differencesFound++;
            this.differencesFoundService.setAttribute(this.differencesFound);
            if (this.differencesFound === this.numberDifferences) {
                // this.showDialog();
            }
            return diff;
        } else {
            this.audio.playFailSound();
            canvas.displayErrorMessage(event);
            return undefined;
        }
        // this.clicks$.next(event);
    }

    // private showDialog() {
    //     const dialogRef = this.dialog.open(DialaogGameOverComponent);

    //     dialogRef.afterClosed().subscribe(() => {});
    // }
    // private wait() {
    //     this.allowed = false;
    //     setTimeout(() => {
    //         this.allowed = true;
    //     }, 1000);
    // }
}
