import { Injectable } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
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
    private startPos: Vec2;
    private isDrawing = false;
    private isDrawingRect = false;
    private isErasing = false;
    private restoreArray: ImageData[] = [];
    private redoArray: ImageData[] = [];
    private index = INITIAL_INDEX;
    private indexRedo = INITIAL_INDEX;
    private tempCanvas: HTMLCanvasElement;
    private tempContext: CanvasRenderingContext2D;
    constructor(private canvas: HTMLCanvasElement) {
        this.context = canvas.getContext('2d') as CanvasRenderingContext2D;
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
    static switch(canvas1: HTMLCanvasElement, canvas2: HTMLCanvasElement) {
        const image1 = canvas1.getContext('2d')?.getImageData(0, 0, canvas1.width, canvas1.height) as ImageData;
        const image2 = canvas2.getContext('2d')?.getImageData(0, 0, canvas2.width, canvas2.height) as ImageData;
        canvas2.getContext('2d')?.putImageData(image1, 0, 0);
        canvas1.getContext('2d')?.putImageData(image2, 0, 0);
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
        this.tempContext = this.tempCanvas.getContext('2d') as CanvasRenderingContext2D;
        container?.insertAdjacentElement('afterbegin', this.tempCanvas);
        this.tempCanvas.style.position = 'absolute';
        this.tempCanvas.style.zIndex = '1';
        this.tempContext.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
    }

    drawRectangle(event: MouseEvent, keyboardEvent?: KeyboardEvent) {
        if (!this.isDrawingRect) return;
        if (this.context) this.context.fillStyle = this.drawColor;
        if (this.tempContext) this.tempContext.fillStyle = this.drawColor;
        const width = event.offsetX - this.startPos.posX;
        const height = event.offsetY - this.startPos.posY;
        if (keyboardEvent && keyboardEvent.shiftKey) {
            this.context.fillRect(this.startPos.posX, this.startPos.posY, Math.min(width, height), Math.min(width, height));
        } else {
            this.tempContext.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
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
            this.context.fillRect(this.startPos.posX, this.startPos.posY, event.offsetX - this.startPos.posX, event.offsetY - this.startPos.posY);
            this.tempCanvas.remove();
        }
        if (this.isErasing) {
            this.context.globalCompositeOperation = 'source-over';
            this.isErasing = false;
        }
        this.context?.closePath();
        if (event.type !== 'mouseout') {
            this.restoreArray.push(this.context.getImageData(0, 0, this.canvas.width, this.canvas.height));
            this.index += 1;
        }
    }
    reset() {
        this.context?.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.restoreArray = [];
        this.index = -1;
    }

    undo() {
        if (this.index < 0) return;
        if (this.index === 0) {
            this.indexRedo += 1;
            this.redoArray.push(this.restoreArray.pop() as ImageData);
            this.reset();
        } else {
            this.index -= 1;
            this.indexRedo += 1;
            this.context?.putImageData(this.restoreArray[this.index], 0, 0);
            this.redoArray.push(this.restoreArray.pop() as ImageData);
        }
    }
    redo() {
        if (this.indexRedo >= 0) {
            this.context?.putImageData(this.redoArray[this.indexRedo], 0, 0);
            this.indexRedo -= 1;
            this.index += 1;
            this.restoreArray.push(this.redoArray.pop() as ImageData);
        }
    }
}
