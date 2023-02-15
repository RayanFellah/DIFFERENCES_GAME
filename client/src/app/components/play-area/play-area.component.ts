import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CanvasTestHelper } from '@app/services/canvas-test-helper';
import { GameLogicService } from '@app/services/game-logic.service';
import { HttpService } from '@app/services/http.service';
// TODO : Avoir un fichier séparé pour les constantes!
export const DEFAULT_WIDTH = 640;
export const DEFAULT_HEIGHT = 480;

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit {
    @ViewChild('canvas1', { static: false }) private canvas1!: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas2', { static: false }) private canvas2!: ElementRef<HTMLCanvasElement>;
    logic: GameLogicService;
    clickEnabled = true;
    private canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
    constructor(private http: HttpService) {}

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    ngAfterViewInit(): void {
        this.logic = new GameLogicService(
            new CanvasTestHelper(this.canvas1.nativeElement),
            new CanvasTestHelper(this.canvas2.nativeElement),
            this.http,
        );
    }

    async handleClick(event: MouseEvent) {
        await this.logic.sendCLick(event);
    }
}
