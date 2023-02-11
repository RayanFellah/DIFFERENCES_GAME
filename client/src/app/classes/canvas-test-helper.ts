import { ElementRef, Injectable } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
@Injectable({
    providedIn: 'root',
})
export class CanvasTestHelper {
    context: CanvasRenderingContext2D | null;
    private canvasRef: HTMLCanvasElement;
    private COLOR: number[] = [0, 0, 255, 255];

    constructor(canvasRef: ElementRef<HTMLCanvasElement>) {
        this.canvasRef = canvasRef.nativeElement;
        this.context = this.canvasRef.getContext('2d');
    }

    createCanvas(width: number, height: number): HTMLCanvasElement {
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    drawImageOnCanvas(path: string) {
        const image = new Image();
        image.src = path; // recupere limage
        image.onload = () => {
            this.context!.drawImage(image, 0, 0); // dessine limage sur le canvas
        };
    }

    changeColor(coords: Vec2[]) {
        const imageData = this.context!.getImageData(0, 0, this.canvasRef.width, this.canvasRef.height);
        const data = imageData.data;
        for (const coord of coords) {
            const index = (coord.x + coord.y * this.canvasRef.width) * 4; // calculer l'index du pixel à partir de ses coordonnées (100, 100)
            data[index + 0] = this.COLOR[0]; // R (rouge)
            data[index + 1] = this.COLOR[1]; // G (vert)
            data[index + 2] = this.COLOR[2]; // B (bleu)
            data[index + 3] = this.COLOR[3]; // A (alpha)
        }
        this.context.putImageData(imageData, 0, 0);
    }
}
