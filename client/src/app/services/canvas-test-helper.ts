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
    private COLOR: number[] = [0, 0, 255, 255];

    constructor(canvasRef: HTMLCanvasElement) {
        this.canvasRef = canvasRef;
        this.context = this.canvasRef.getContext('2d');
        this.width = this.canvasRef.width;
        this.height = this.canvasRef.height;
    }

    createCanvas(width: number, height: number): HTMLCanvasElement {
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    drawImageOnCanvas(file: File) {
        const imageURL = URL.createObjectURL(file);
        const image = new Image();
        image.src = imageURL; // recupere limage
        image.onload = () => {
            this.context?.drawImage(image, 0, 0); // dessine limage sur le canvas
        };
    }
    updateImage(coords: Coord[]) {
        const imageData = this.context?.getImageData(0, 0, this.width, this.height);
        this.changeColor(coords, imageData.data);
        this.context?.putImageData(imageData, 0, 0);
    }

    changeColor(coords: Coord[], data: Uint8ClampedArray) {
        for (const coord of coords) {
            const index = (coord.posX + coord.posY * this.canvasRef.width) * 4; // calculer l'index du pixel à partir de ses coordonnées (100, 100)
            data[index + 0] = this.COLOR[0]; // R (rouge)
            data[index + 1] = this.COLOR[1]; // G (vert)
            data[index + 2] = this.COLOR[2]; // B (bleu)
            data[index + 3] = this.COLOR[3]; // A (alpha)
        }
    }
}
