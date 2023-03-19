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

    setCanvas(canvas: HTMLCanvasElement) {
        this.canvasRef = canvas;
    }
    getCanvas() {
        return this.canvasRef;
    }

    drawImageOnCanvas(blob: Blob) {
        this.url = URL.createObjectURL(blob);
        const image = new Image();
        image.src = this.url;
        image.onload = () => {
            if (this.context) {
                this.context.drawImage(image, 0, 0);
            }
        };
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

    displayErrorMessage(event: MouseEvent) {
        if (this.disable) return;
        this.disable = true;
        const temp: ImageData | undefined = this.context?.getImageData(0, 0, this.width, this.height);
        if (this.context) this.context.font = FONT_STYLE;
        this.context?.fillText('ERROR', event.offsetX, event.offsetY);
        setTimeout(() => {
            if (temp) this.context?.putImageData(temp, 0, 0);
            this.disable = false;
        }, ONE_SECOND);
    }
    // drawingOnImage() {
    //     const mouseDownStream = fromEvent(this.canvasRef, 'mousedown');
    //     const mouseMoveStream = fromEvent(this.canvasRef, 'mousemove');
    //     const mouseUpStream = fromEvent(window, 'mouseup');

    //     mouseDownStream.pipe(
    //         tap((event: MouseEvent) => {
    //             if (this.context) {
    //                 this.context.beginPath();
    //                 this.context.strokeStyle = 'this.color';
    //                 this.context.lineWidth = 5;
    //                 this.context.lineJoin = 'round';
    //                 this.context?.moveTo(event.offsetX, event.offsetY);
    //             }
    //         }) as OperatorFunction<Event, MouseEvent>,
    //         switchMap(() =>
    //             mouseMoveStream.pipe(
    //                 tap((event: MouseEvent) => {
    //                     this.context?.lineTo(event.offsetX, event.offsetY);
    //                     this.context?.stroke();
    //                 }) as OperatorFunction<Event, MouseEvent>,
    //                 takeUntil(mouseUpStream),
    //                 finalize(() => {
    //                     this.context?.closePath();
    //                 }),
    //             ),
    //         ),
    //     );
    // }
    ngOnDestroy(): void {
        URL.revokeObjectURL(this.url);
    }
}
