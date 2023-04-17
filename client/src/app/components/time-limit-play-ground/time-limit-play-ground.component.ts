import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { TimeLimitModeService } from '@app/services/time-limit-mode.service';
import { HEIGHT, WIDTH } from 'src/constants';

@Component({
    selector: 'app-time-limit-play-ground',
    templateUrl: './time-limit-play-ground.component.html',
    styleUrls: ['./time-limit-play-ground.component.scss'],
    providers: [],
})
export class TimeLimitPlayGroundComponent implements AfterViewInit {
    @ViewChild('canvas1', { static: false }) private canvas1!: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas2', { static: false }) private canvas2!: ElementRef<HTMLCanvasElement>;
    private canvasSize = { x: WIDTH, y: HEIGHT };

    constructor(private gameLogic: TimeLimitModeService) {}

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    ngAfterViewInit() {
        this.gameLogic.bindCanvasRefs(this.canvas1.nativeElement, this.canvas2.nativeElement);
        this.gameLogic.drawOnCanvas();
    }

    handleClick(event: MouseEvent) {
        this.gameLogic.sendClick(event);
    }
}
