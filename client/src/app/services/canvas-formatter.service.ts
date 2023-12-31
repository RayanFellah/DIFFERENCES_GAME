import { Injectable } from '@angular/core';
import { FONT_STYLE, HEIGHT, ONE_SECOND, WIDTH } from 'src/constants';

@Injectable({
    providedIn: 'root',
})
export class CanvasFormatterService {
    private disable: boolean = false;
    private width = WIDTH;
    private height = HEIGHT;

    drawImageOnCanvas(blob: Blob, image: HTMLImageElement, context: CanvasRenderingContext2D) {
        const url = URL.createObjectURL(blob);
        image.src = url;
        image.onload = () => {
            context.drawImage(image, 0, 0);
            URL.revokeObjectURL(url);
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    displayErrorMessage(event: any, context: CanvasRenderingContext2D) {
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
}
