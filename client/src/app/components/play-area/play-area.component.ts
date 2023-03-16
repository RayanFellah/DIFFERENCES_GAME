import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CanvasHelperService } from '@app/services/canvas-helper.service';
import { DifferencesFoundService } from '@app/services/differences-found.service';
import { GameLogicService } from '@app/services/game-logic.service';
import { ImageHttpService } from '@app/services/image-http.service';
import { SheetHttpService } from '@app/services/sheet-http.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { PlayRoom } from '@common/play-room';
import { HEIGHT, WIDTH } from 'src/constants';
// import { EventEmitter } from 'events';
@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit {
    @Output() differenceFound: EventEmitter<boolean> = new EventEmitter();
    @Output() difficulty = new EventEmitter();
    @Input() playerName: string;
    @ViewChild('canvas1', { static: false }) private canvas1!: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas2', { static: false }) private canvas2!: ElementRef<HTMLCanvasElement>;

    // differenceFound: Subject<string> = new Subject<string>();
    logic: GameLogicService;
    clickEnabled = true;
    room: PlayRoom;

    private canvasSize = { x: WIDTH, y: HEIGHT };

    constructor(
        private socketService: SocketClientService,
        private imageHttp: ImageHttpService,
        private differencesFoundService: DifferencesFoundService,
        private sheetService: SheetHttpService,
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
            this.imageHttp,
            this.differencesFoundService,
            this.activatedRoute,
            this.sheetService,
            this.socketService,
        );
        await this.logic.start().then((difficulty: string) => {
            this.difficulty.emit(difficulty);
        });
    }

    handleClick(event: MouseEvent) {
        this.logic.setClick(event, this.playerName);
    }
}
