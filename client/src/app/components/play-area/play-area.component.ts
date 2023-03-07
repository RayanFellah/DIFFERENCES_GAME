import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CanvasHelperService } from '@app/services/canvas-helper.service';
import { DifferencesFoundService } from '@app/services/differences-found.service';
import { GameHttpService } from '@app/services/game-http.service';
import { GameLogicService } from '@app/services/game-logic.service';
import { GameSelectorService } from '@app/services/game-selector.service';
import { ImageHttpService } from '@app/services/image-http.service';
import { HEIGHT, WIDTH } from 'src/constants';
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
    private canvasSize = { x: WIDTH, y: HEIGHT };
    constructor(
        private imageHttp: ImageHttpService,
        private gameHttp: GameHttpService,
        private readonly gameSelector: GameSelectorService,
        private differencesFoundService: DifferencesFoundService,
    ) {}

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    ngAfterViewInit(): void {
        this.logic = new GameLogicService(
            new CanvasHelperService(this.canvas1.nativeElement),
            new CanvasHelperService(this.canvas2.nativeElement),
            this.gameHttp,
            this.imageHttp,
            this.gameSelector,
            this.differencesFoundService,
        );
    }

    async handleClick(event: MouseEvent) {
        if (this.logic) {
            this.logic.sendCLick(event);
        }
    }
}
