/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { Sheet } from '@common/sheet';
import { BLACK_COLOR, CHEAT_BLINK_INTERVAL, HEIGHT, RGBA_LENGTH, WIDTH } from 'src/constants';
import { CanvasHelperService } from './canvas-helper.service';
import { GameHttpService } from './game-http.service';

@Injectable({
    providedIn: 'root',
})
export class CheatModeService {
    differences: Vec2[][];
    cheatModeActivated: boolean = false;
    color1: ImageData;
    color2: ImageData;
    constructor(private readonly gameHttp: GameHttpService) {}
    getDifferences(sheet: Sheet) {
        this.gameHttp.getAllDifferences(sheet._id).subscribe((res) => {
            this.differences = res;
        });
    }
    setColor(color: Uint8ClampedArray, canvas: CanvasHelperService, index: number) {
        canvas.context!.fillStyle = `rgba(${color[index]},${color[index + 1]},${color[index + 2]},${color[index + 3]})`;
    }
    cheatBlink(canvas1: CanvasHelperService, canvas2: CanvasHelperService, original: ImageData, modified: ImageData) {
        this.color1 = canvas1.context!.getImageData(0, 0, WIDTH, HEIGHT);
        this.color2 = canvas2.context!.getImageData(0, 0, WIDTH, HEIGHT);
        let condition = true;
        this.cheatModeActivated = !this.cheatModeActivated;
        const interval = setInterval(() => {
            if (this.cheatModeActivated) {
                for (const difference of this.differences) {
                    for (const pixel of difference) {
                        const index = (pixel.posX + pixel.posY * WIDTH) * RGBA_LENGTH;
                        if (condition) {
                            this.setColor(this.color1.data, canvas1, index);
                            this.setColor(this.color1.data, canvas2, index);
                        } else {
                            this.setColor(this.color2.data, canvas1, index);
                            this.setColor(this.color2.data, canvas2, index);
                        }
                        canvas2.context!.fillRect(pixel.posX, pixel.posY, 1, 1);
                        canvas1.context!.fillRect(pixel.posX, pixel.posY, 1, 1);
                    }
                }
                condition = !condition;
            } else {
                this.stopCheating(canvas1, canvas2, original, modified);
                clearInterval(interval);
            }
        }, CHEAT_BLINK_INTERVAL);
    }
    stopCheating(canvas1: CanvasHelperService, canvas2: CanvasHelperService, original: ImageData, modified: ImageData) {
        canvas1.context?.putImageData(original, 0, 0);
        canvas2.context?.putImageData(modified, 0, 0);
        canvas1.context!.font = BLACK_COLOR;
        canvas2.context!.font = BLACK_COLOR;
    }
    removeDifference(diff: Vec2[]) {
        this.differences = this.differences.filter((d2) => {
            return d2.toString() !== diff.toString();
        });
    }
}
