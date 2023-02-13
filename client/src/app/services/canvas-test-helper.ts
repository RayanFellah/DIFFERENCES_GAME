import { Injectable } from '@angular/core';
import { Coord } from '@app/interfaces/coord';
@Injectable({
    providedIn: 'root',
})
export class CanvasTestHelper {
    context: CanvasRenderingContext2D | null;
    canvasRef: HTMLCanvasElement;
    width: number;
    height: number;
    isOpaque: boolean = false;
    tempImageData;
    private COLOR: number[] = [0, 0, 255, 255];
    private FONT_STYLE = 'Arial 20px';

    constructor(context: CanvasRenderingContext2D) {
        // customElements.define('canvasElement', HTMLCanvasElement);
        // this.canvasRef = canvasRef;
        this.width = 640;
        this.height = 480;
        if (this.context) this.tempImageData = this.context.getImageData(0, 0, this.width, this.height);
    }

    createCanvas(width: number, height: number): HTMLCanvasElement {
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    drawImageOnCanvas(file: File) {
        const url = URL.createObjectURL(file);
        const image = new Image();
        image.src = url; // recupere limage
        image.onload = () => {
            if (this.context) {
                this.context.drawImage(image, 0, 0); // dessine limage sur le canvas
            }
        };
    }

    updateImage(coords: Coord[]) {
        if (this.context) {
            const imageData = this.context.getImageData(0, 0, this.width, this.height);
            this.changeColor(coords, imageData.data);
            this.context.putImageData(imageData, 0, 0);
        }
    }

    changeColor(coords: Coord[], data: Uint8ClampedArray) {
        for (const coord of coords) {
            const index = (coord.posX + coord.posY * this.width) * 4; // calculer l'index du pixel à partir de ses coordonnées (100, 100)
            // data[index + 0] = 0; // R (rouge)
            // data[index + 1] = 0; // G (vert)
            // data[index + 2] = 255; // B (bleu)
            if (this.tempImageData) data[index + 3] = this.isOpaque ? this.COLOR[3] : this.tempImageData.data[index + 3]; // A (alpha)
        }
        this.isOpaque = !this.isOpaque;
        return undefined;
    }

    displayErrorMessage(event: MouseEvent) {
        const temp: ImageData | undefined = this.context?.getImageData(0, 0, this.width, this.height);
        if (this.context) this.context.font = this.FONT_STYLE;
        this.context?.fillText('ERROR', event.offsetX, event.offsetY);
        setTimeout(() => {
            if (temp) this.context?.putImageData(temp, 0, 0);
        }, 1000);
    }
}
