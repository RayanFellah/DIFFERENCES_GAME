import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { GameReplayService } from '@app/services/game-replay/game-replay.service';
import { HintsService } from '@app/services/hints.service';

@Component({
    selector: 'app-hint-message',
    templateUrl: './hint-message.component.html',
    styleUrls: ['./hint-message.component.scss'],
})
export class HintMessageComponent implements AfterViewChecked {
    @ViewChild('diff', { static: false }) canvas: ElementRef<HTMLCanvasElement> | undefined;
    dataAsNumber: number;
    draw: boolean = true;
    constructor(readonly hintService: HintsService, public gameReplayService: GameReplayService, private cdRef: ChangeDetectorRef) {}
    ngAfterViewChecked(): void {
        if (this.hintService.hintsLeft === 0 && (this.draw || this.gameReplayService.isLastHint)) {
            const difference = this.hintService.executeThirdHint();
            const c = this.canvas?.nativeElement;
            if (c) {
                this.gameReplayService.isLastHint = false;
                this.draw = false;
                this.gameReplayService.events.push({
                    type: 'lastHint',
                    timestamp: Date.now(),
                    data: difference,
                });
                this.drawDiff(difference);
            }
        }
    }

    drawDiff(difference: Vec2[]) {
        const context = this.canvas?.nativeElement.getContext('2d') as CanvasRenderingContext2D;
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
        if (this.canvas) {
            this.canvas.nativeElement.width = maxX - minX + 1;
            this.canvas.nativeElement.height = maxY - minY + 1;
            for (const pixel of difference) {
                context.fillRect(pixel.posX - minX, pixel.posY - minY, 1, 1);
            }

            context.drawImage(this.canvas?.nativeElement, 0, 0);
        }
    }
    onNgIfChange() {
        this.canvas = undefined;
        this.cdRef.detectChanges();
    }
}
