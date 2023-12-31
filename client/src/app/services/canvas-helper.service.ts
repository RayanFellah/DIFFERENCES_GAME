/* eslint-disable max-params */
import { Inject, Injectable, OnDestroy } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { FONT_STYLE, HEIGHT, ONE_SECOND, WIDTH } from 'src/constants';
@Injectable({
    providedIn: 'root',
})
export class CanvasHelperService implements OnDestroy {
    context: CanvasRenderingContext2D | null;
    width = WIDTH;
    height = HEIGHT;
    isOn: boolean = false;
    tempImageData: ImageData;
    url: string;
    disable: boolean = false;
    constructor(@Inject(HTMLCanvasElement) private canvasRef: HTMLCanvasElement) {
        this.context = canvasRef.getContext('2d', { willReadFrequently: true });
        if (this.context) this.tempImageData = this.context.getImageData(0, 0, WIDTH, HEIGHT);
    }

    static createCanvas(width: number, height: number): HTMLCanvasElement {
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    getCanvas() {
        return this.canvasRef;
    }

    setContext(canvas: HTMLCanvasElement) {
        this.context = canvas.getContext('2d');
    }

    drawImageOnCanvas(blob: Blob) {
        this.url = URL.createObjectURL(blob);
        const image = new Image();
        image.onload = () => {
            if (this.context) {
                this.context.drawImage(image, 0, 0);
            }
        };

        image.src = this.url;
    }

    getColor() {
        this.tempImageData = this.context?.getImageData(0, 0, WIDTH, HEIGHT) as ImageData;
        return this.tempImageData;
    }

    updateImage(coords: Vec2[], color1: ImageData, color2: ImageData) {
        if (this.context) {
            const imageData = this.context.getImageData(0, 0, this.width, this.height);
            this.changeColor(coords, imageData.data, color1, color2);
            this.context.putImageData(imageData, 0, 0);
        }
    }

    changeColor(coords: Vec2[], data: Uint8ClampedArray, color1: ImageData, color2: ImageData) {
        for (const coord of coords) {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            const index = (coord.posX + coord.posY * this.width) * 4;
            if (this.tempImageData) {
                data[index + 0] = this.isOn ? color1.data[index + 0] : color2.data[index + 0];
                data[index + 1] = this.isOn ? color1.data[index + 1] : color2.data[index + 1];
                data[index + 2] = this.isOn ? color1.data[index + 2] : color2.data[index + 2];
                data[index + 3] = this.isOn ? color1.data[index + 3] : color2.data[index + 3];
            }
        }
        this.isOn = !this.isOn;
        return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    displayErrorMessage(event: any) {
        if (this.disable) return;
        this.disable = true;
        const temp: ImageData | undefined = this.context?.getImageData(0, 0, this.width, this.height);
        if (this.context) this.context.font = FONT_STYLE;
        this.context?.fillText('ERROR', event.x, event.y);
        setTimeout(() => {
            if (temp) this.context?.putImageData(temp, 0, 0);
            this.disable = false;
        }, ONE_SECOND);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    displayErrorMessage2(event: any, context: CanvasRenderingContext2D) {
        if (this.disable) return;
        this.disable = true;
        const temp: ImageData | undefined = context?.getImageData(0, 0, this.width, this.height);
        if (context) context.font = FONT_STYLE;
        context?.fillText('ERROR', event.x, event.y);
        setTimeout(() => {
            if (temp) context?.putImageData(temp, 0, 0);
            this.disable = false;
        }, ONE_SECOND);
    }
    ngOnDestroy(): void {
        URL.revokeObjectURL(this.url);
    }
}
