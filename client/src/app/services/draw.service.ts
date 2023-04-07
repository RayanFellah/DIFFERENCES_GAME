import { Injectable } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { HEIGHT, WIDTH } from 'src/constants';
import { CanvasHelperService } from './canvas-helper.service';

const INITIAL_INDEX = -1;
const DEFAULT_DRAWING_COLOR = 'black';
const DEFAULT_PENCIL_SIZE = 2;
@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    context: CanvasRenderingContext2D;
    drawColor = DEFAULT_DRAWING_COLOR;
    pencilWidth = DEFAULT_PENCIL_SIZE;
    shiftKeyPressed: boolean = false;
    private startPos: Vec2;
    private isDrawing: boolean = false;
    private isDrawingRect = false;
    private isErasing = false;
    private restoreArray: ImageData[] = [];
    private redoArray: ImageData[] = [];
    private restoreIndex = INITIAL_INDEX;
    private redoIndex = INITIAL_INDEX;
    private tempCanvas: HTMLCanvasElement;
    private tempContext: CanvasRenderingContext2D;
    constructor(private canvas: HTMLCanvasElement) {
        this.context = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    }
    static duplicate(canvas1: HTMLCanvasElement, canvas2: HTMLCanvasElement) {
        const dataImage1 = canvas1.getContext('2d')?.getImageData(0, 0, canvas1.width, canvas1.height).data;
        const dataImage2 = canvas2.getContext('2d')?.getImageData(0, 0, canvas2.width, canvas2.height).data;
        if (dataImage1?.toString() === dataImage2?.toString()) {
            alert('Les modifications sont déjà les mêmes');
        } else {
            const image = canvas1.getContext('2d')?.getImageData(0, 0, canvas1.width, canvas2.height) as ImageData;
            canvas2.getContext('2d')?.putImageData(image, 0, 0);
        }
    }

    switch(canvas1: HTMLCanvasElement, canvas2: HTMLCanvasElement) {
        const image2 = canvas2.getContext('2d')?.getImageData(0, 0, canvas2.width, canvas2.height) as ImageData;
        const image1 = canvas1.getContext('2d')?.getImageData(0, 0, canvas1.width, canvas1.height) as ImageData;
        canvas1.getContext('2d')?.putImageData(image2, 0, 0);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.restoreArray.push(canvas1.getContext('2d')!.getImageData(0, 0, WIDTH, HEIGHT));
        this.restoreIndex += 1;
        canvas2.getContext('2d')?.putImageData(image1, 0, 0);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.restoreArray.push(canvas2.getContext('2d')!.getImageData(0, 0, WIDTH, HEIGHT));
        this.restoreIndex += 1;
    }
    drawPencil(event: MouseEvent) {
        if (event.type === 'mousedown') {
            this.isDrawingRect = false;
            this.isDrawing = true;
            this.isErasing = false;
            if (this.context) {
                this.context.beginPath();
                this.context.moveTo(event.offsetX, event.offsetY);
            }
        }
        if (this.isDrawing && event.type === 'mousemove') {
            if (this.context) {
                this.context.lineTo(event.offsetX, event.offsetY);
                this.context.strokeStyle = this.drawColor;
                this.context.lineWidth = this.pencilWidth;
                this.context.lineCap = 'round';
                this.context.lineJoin = 'round';
                this.context.stroke();
            }
        }
    }

    startDrawingRect(event: MouseEvent, container?: HTMLDivElement) {
        this.isDrawing = false;
        this.isDrawingRect = true;
        this.isErasing = false;
        this.startPos = { posX: event.offsetX, posY: event.offsetY };
        this.tempCanvas = CanvasHelperService.createCanvas(this.canvas.width, this.canvas.height);
        this.tempCanvas.style.border = '1px solid black';
        this.tempContext = this.tempCanvas.getContext('2d') as CanvasRenderingContext2D;
        container?.insertAdjacentElement('afterbegin', this.tempCanvas);
        this.tempCanvas.style.position = 'absolute';
        this.tempCanvas.style.top = '8.6%';
        this.tempCanvas.style.zIndex = '1';
        this.tempContext.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
    }

    drawRectangle(event: MouseEvent) {
        if (!this.isDrawingRect) return;
        if (this.context) this.context.fillStyle = this.drawColor;
        if (this.tempContext) this.tempContext.fillStyle = this.drawColor;
        const width = event.offsetX - this.startPos.posX;
        const height = event.offsetY - this.startPos.posY;
        this.tempContext.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
        if (this.shiftKeyPressed) {
            this.tempContext.fillRect(this.startPos.posX, this.startPos.posY, Math.min(width, height), Math.min(width, height));
        } else {
            this.tempContext.fillRect(this.startPos.posX, this.startPos.posY, width, height);
        }
    }
    erase(event: MouseEvent) {
        if (event.type === 'mousedown') {
            this.isErasing = true;
            this.isDrawing = false;
            this.isDrawingRect = false;
            this.context.beginPath();
            this.context.moveTo(event.offsetX, event.offsetY);
        }
        if (this.isErasing && event.type === 'mousemove') {
            this.context.globalCompositeOperation = 'destination-out';
            this.context.lineWidth = this.pencilWidth;
            this.context.lineTo(event.offsetX, event.offsetY);
            this.context.stroke();
        }
    }
    stop(event: MouseEvent) {
        if (this.isDrawing) {
            this.isDrawing = false;
        }
        if (this.isDrawingRect) {
            this.isDrawingRect = false;
            const width = event.offsetX - this.startPos.posX;
            const height = event.offsetY - this.startPos.posY;
            if (this.shiftKeyPressed) {
                this.context.fillRect(this.startPos.posX, this.startPos.posY, Math.min(width, height), Math.min(width, height));
            } else {
                this.context.fillRect(this.startPos.posX, this.startPos.posY, width, height);
            }
            this.tempContext.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
            this.tempCanvas.remove();
        }
        if (this.isErasing) {
            this.context.globalCompositeOperation = 'source-over';
            this.context.lineCap = 'square';
            this.isErasing = false;
        }
        this.context?.closePath();
        if (event.type !== 'mouseout') {
            this.restoreArray.push(this.context.getImageData(0, 0, this.canvas.width, this.canvas.height));
            this.restoreIndex += 1;
            this.resetValues(true);
        }
    }
    reset() {
        this.context?.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.resetValues(false);
        this.resetValues(true);
    }

    undo() {
        if (this.restoreIndex < 0) return;
        if (this.restoreIndex === 0) {
            this.redoIndex += 1;
            this.redoArray.push(this.restoreArray.pop() as ImageData);
            this.context?.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.resetValues(false);
        } else {
            this.restoreIndex -= 1;
            this.redoIndex += 1;
            this.context?.putImageData(this.restoreArray[this.restoreIndex], 0, 0);
            this.redoArray.push(this.restoreArray.pop() as ImageData);
        }
    }
    redo() {
        if (this.redoIndex >= 0) {
            this.context?.putImageData(this.redoArray[this.redoIndex], 0, 0);
            this.redoIndex -= 1;
            this.restoreIndex += 1;
            this.restoreArray.push(this.redoArray.pop() as ImageData);
        }
    }

    redoBothCanvas(canvas1: HTMLCanvasElement, canvas2: HTMLCanvasElement) {
        if (this.redoIndex >= 0) {
            canvas1.getContext('2d')?.putImageData(this.redoArray[this.redoIndex], 0, 0);
            canvas2.getContext('2d')?.putImageData(this.redoArray[this.redoIndex], 0, 0);
            // this.redoIndex -= 1;
            this.restoreIndex += 1;
            this.restoreArray.push(this.redoArray.pop() as ImageData);
        }
    }
    private resetValues(isRedo: boolean) {
        if (isRedo) {
            this.redoIndex = INITIAL_INDEX;
            this.redoArray = [];
        } else {
            this.restoreIndex = INITIAL_INDEX;
            this.restoreArray = [];
        }
    }
}
