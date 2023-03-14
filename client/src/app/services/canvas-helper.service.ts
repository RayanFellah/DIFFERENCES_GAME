import { Inject, Injectable, OnDestroy } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { finalize, fromEvent, OperatorFunction, switchMap, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { COLOR, FONT_STYLE, HEIGHT, WIDTH } from 'src/constants';
@Injectable({
    providedIn: 'root',
})
export class CanvasHelperService implements OnDestroy {
    context: CanvasRenderingContext2D | null;
    width = WIDTH;
    height = HEIGHT;
    isOpaque: boolean = false;
    tempImageData: ImageData;
    url: string;
    color: string;
    constructor(@Inject(HTMLCanvasElement) private canvasRef: HTMLCanvasElement) {
        this.context = canvasRef.getContext('2d');
        if (this.context) this.tempImageData = this.context.getImageData(0, 0, WIDTH, HEIGHT);
    }

    static createCanvas(width: number, height: number): HTMLCanvasElement {
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    set(canvas: HTMLCanvasElement) {
        this.canvasRef = canvas;
    }
    get() {
        return this.canvasRef;
    }

    drawImageOnCanvas(blob: Blob) {
        this.url = URL.createObjectURL(blob);
        const image = new Image();
        image.src = this.url; // récupère limage
        image.onload = () => {
            if (this.context) {
                this.context.drawImage(image, 0, 0); // dessine limage sur le canvas
            }
        };
    }

    updateImage(coords: Vec2[]) {
        if (this.context) {
            const imageData = this.context.getImageData(0, 0, this.width, this.height);
            this.changeColor(coords, imageData.data);
            this.context.putImageData(imageData, 0, 0);
        }
    }

    changeColor(coords: Vec2[], data: Uint8ClampedArray) {
        for (const coord of coords) {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            const index = (coord.posX + coord.posY * this.width) * 4;
            if (this.tempImageData) data[index + 3] = this.isOpaque ? COLOR[3] : this.tempImageData.data[index + 3];
        }
        this.isOpaque = !this.isOpaque;
        return undefined;
    }

    displayErrorMessage(event: MouseEvent) {
        const temp: ImageData | undefined = this.context?.getImageData(0, 0, this.width, this.height);
        if (this.context) this.context.font = FONT_STYLE;
        this.context?.fillText('ERROR', event.offsetX, event.offsetY);
        setTimeout(() => {
            if (temp) this.context?.putImageData(temp, 0, 0);
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        }, 1000);
    }
    drawingOnImage() {
        const mouseDownStream = fromEvent(this.canvasRef, 'mousedown');
        const mouseMoveStream = fromEvent(this.canvasRef, 'mousemove');
        const mouseUpStream = fromEvent(window, 'mouseup');

        mouseDownStream.pipe(
            tap((event: MouseEvent) => {
                if (this.context) {
                    this.context.beginPath();
                    this.context.strokeStyle = 'this.color';
                    this.context.lineWidth = 5;
                    this.context.lineJoin = 'round';
                    this.context?.moveTo(event.offsetX, event.offsetY);
                }
            }) as OperatorFunction<Event, MouseEvent>,
            switchMap(() =>
                mouseMoveStream.pipe(
                    tap((event: MouseEvent) => {
                        this.context?.lineTo(event.offsetX, event.offsetY);
                        this.context?.stroke();
                    }) as OperatorFunction<Event, MouseEvent>,
                    takeUntil(mouseUpStream),
                    finalize(() => {
                        this.context?.closePath();
                    }),
                ),
            ),
        );
    }
    ngOnDestroy(): void {
        URL.revokeObjectURL(this.url);
    }
}
