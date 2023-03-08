import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CanvasHelperService } from '@app/services/canvas-helper.service';
import { DifferencesFoundService } from '@app/services/differences-found.service';
import { EventService } from '@app/services/event-service.service';
import { GameHttpService } from '@app/services/game-http.service';
import { GameLogicService } from '@app/services/game-logic.service';
import { GameSelectorService } from '@app/services/game-selector.service';
import { ImageHttpService } from '@app/services/image-http.service';
import { LocalStorageService } from '@app/services/local-storage.service';
import { SheetHttpService } from '@app/services/sheet-http.service';
import { PlayRoom } from '@common/play-room';
import { Sheet } from '@common/sheet';
import { HEIGHT, WIDTH } from 'src/constants';
// import { EventEmitter } from 'events';
@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit {
    @Output() differenceFound: EventEmitter<boolean> = new EventEmitter();
    @ViewChild('canvas1', { static: false }) private canvas1!: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas2', { static: false }) private canvas2!: ElementRef<HTMLCanvasElement>;

    // differenceFound: Subject<string> = new Subject<string>();
    logic: GameLogicService;
    clickEnabled = true;
    room: PlayRoom;

    private canvasSize = { x: WIDTH, y: HEIGHT };

    constructor(
        private imageHttp: ImageHttpService,
        private gameHttp: GameHttpService,
        private readonly gameSelector: GameSelectorService,
        private differencesFoundService: DifferencesFoundService,
        public localStorage: LocalStorageService,
        private sheetService: SheetHttpService,
        @Inject('EventService') private eventService: EventService,
        private activatedRoute: ActivatedRoute,
    ) {}

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    async ngAfterViewInit(): Promise<void> {
        this.logic = new GameLogicService(
            new CanvasHelperService(this.canvas1.nativeElement),
            new CanvasHelperService(this.canvas2.nativeElement),
            this.gameHttp,
            this.imageHttp,
            this.gameSelector,
            this.differencesFoundService,
        );
        const sheetId = this.activatedRoute.snapshot.params['id'];
        this.sheetService.getSheet(sheetId).subscribe((sheet: Sheet) => {
            this.gameSelector.currentGame = sheet;
            this.logic.sheet = this.gameSelector.currentGame;
            this.logic.start();
        });
    }

    async handleClick(event: MouseEvent) {
        const found = await this.logic.sendCLick(event);
        this.eventService.emitDifferenceFound(found);
    }
}
