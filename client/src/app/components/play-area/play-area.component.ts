/* eslint-disable max-params */
import { AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CanvasHelperService } from '@app/services/canvas-helper.service';
import { CheatModeService } from '@app/services/cheat-mode.service';
import { GameLogicService } from '@app/services/game-logic.service';
import { HintsService } from '@app/services/hints.service';
import { ImageHttpService } from '@app/services/image-http.service';
import { SheetHttpService } from '@app/services/sheet-http.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { PlayRoom } from '@common/play-room';
import { HEIGHT, WIDTH } from 'src/constants';
// eslint-disable-next-line no-restricted-imports
import { DialogComponent } from '../dialogue/dialog.component';
// import { EventEmitter } from 'events';
@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit, AfterViewChecked, OnDestroy {
    @Output() difficulty = new EventEmitter();
    @Input() playerName: string;
    @ViewChild('canvas1', { static: false }) private canvas1!: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas2', { static: false }) private canvas2!: ElementRef<HTMLCanvasElement>;
    @ViewChild('playAreaContainer', { static: false }) private playAreaContainer!: ElementRef<HTMLDivElement>;
    logic: GameLogicService;
    clickEnabled = true;
    room: PlayRoom;

    private canvasSize = { x: WIDTH, y: HEIGHT };

    constructor(
        private socketService: SocketClientService,
        private imageHttp: ImageHttpService,
        private sheetService: SheetHttpService,
        private activatedRoute: ActivatedRoute,
        private cheatMode: CheatModeService,
        private dialog: DialogComponent,
        public hintService: HintsService,
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
            this.activatedRoute,
            this.sheetService,
            this.socketService,
            this.cheatMode,
            this.hintService,
        );
        await this.logic.start().then((difficulty: string) => {
            this.difficulty.emit(difficulty);
        });
    }
    ngAfterViewChecked() {
        if (!this.cheatMode.cheatModeActivated && !this.logic.isBlinking) {
            this.logic.updateImagesInformation();
        }
    }
    ngOnDestroy(): void {
        this.hintService.reset();
    }

    handleClick(event: MouseEvent) {
        this.logic.setClick(event, this.playerName);
    }

    blink() {
        this.logic.cheat();
    }
    hint() {
        if (this.hintService.blockClick || this.hintService.differences.toString() === [].toString()) return;
        this.dialog.openHintDialog(this.hintService.hintsLeft);
        this.socketService.send('hint', this.playerName);
        this.hintService.executeHint(this.playAreaContainer.nativeElement);
        const time = 2500;
        setTimeout(() => {
            this.dialog.closeHintDialog();
        }, time);
    }
}
