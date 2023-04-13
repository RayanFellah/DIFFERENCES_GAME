import { AfterViewChecked, Component, ElementRef, ViewChild } from '@angular/core';
import { HintsService } from '@app/services/hints.service';

@Component({
    selector: 'app-hint-message',
    templateUrl: './hint-message.component.html',
    styleUrls: ['./hint-message.component.scss'],
})
export class HintMessageComponent implements AfterViewChecked {
    @ViewChild('diff', { static: false }) canvas: ElementRef<HTMLCanvasElement>;
    dataAsNumber: number;
    draw: boolean = true;
    // constructor(@Inject(MAT_DIALOG_DATA) public data: string | Vec2[]) {
    //     if (typeof data === 'number') this.dataAsNumber = parseInt(data, 10);
    // }
    constructor(readonly hintService: HintsService) {}
    // ngAfterViewChecked(): void {
    //     if (typeof this.data === 'object') {
    //         const c = this.canvas?.nativeElement;
    //         if (c) {
    //             const context = c.getContext('2d') as CanvasRenderingContext2D;

    //             let minX = Infinity;
    //             let minY = Infinity;
    //             let maxX = -Infinity;
    //             let maxY = -Infinity;
    //             for (const pixel of this.data) {
    //                 minX = Math.min(minX, pixel.posX);
    //                 minY = Math.min(minY, pixel.posY);
    //                 maxX = Math.max(maxX, pixel.posX);
    //                 maxY = Math.max(maxY, pixel.posY);
    //             }

    //             this.canvas.nativeElement.width = maxX - minX + 1;
    //             this.canvas.nativeElement.height = maxY - minY + 1;
    //             for (const pixel of this.data) {
    //                 context.fillRect(pixel.posX - minX, pixel.posY - minY, 1, 1);
    //             }

    //             context.drawImage(this.canvas.nativeElement, 0, 0);
    //         }
    //     }
    // }
    ngAfterViewChecked(): void {
        if (this.hintService.hintsLeft === 0 && this.draw) {
            const difference = this.hintService.executeThirdHint();
            const c = this.canvas?.nativeElement;
            if (c) {
                this.draw = false;
                const context = c.getContext('2d') as CanvasRenderingContext2D;

                let minX = Infinity;
                let minY = Infinity;
                let maxX = -Infinity;
                let maxY = -Infinity;
                for (const pixel of difference) {
                    minX = Math.min(minX, pixel.posX);
                    minY = Math.min(minY, pixel.posY);
                    maxX = Math.max(maxX, pixel.posX);
                    maxY = Math.max(maxY, pixel.posY);
                }

                this.canvas.nativeElement.width = maxX - minX + 1;
                this.canvas.nativeElement.height = maxY - minY + 1;
                for (const pixel of difference) {
                    context.fillRect(pixel.posX - minX, pixel.posY - minY, 1, 1);
                }

                context.drawImage(this.canvas.nativeElement, 0, 0);
            }
        }
    }
}
