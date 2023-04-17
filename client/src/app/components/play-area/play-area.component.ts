/* eslint-disable max-params */
import { AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HintMessageComponent } from '@app/components/hint-message/hint-message.component';
import { CanvasHelperService } from '@app/services/canvas-helper.service';
import { CheatModeService } from '@app/services/cheat-mode.service';
import { GameLogicService } from '@app/services/game-logic.service';
import { GameReplayService } from '@app/services/game-replay/game-replay.service';
import { HintsService } from '@app/services/hints.service';
import { ImageHttpService } from '@app/services/image-http.service';
import { SheetHttpService } from '@app/services/sheet-http.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { PlayRoom } from '@common/play-room';
import { HEIGHT, THREE_SECONDS, WIDTH } from 'src/constants';
// eslint-disable-next-line no-restricted-imports
@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
    providers: [HintMessageComponent],
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
    initialHtml: string;
    private canvasSize = { x: WIDTH, y: HEIGHT };

    constructor(
        private socketService: SocketClientService,
        private imageHttp: ImageHttpService,
        private sheetService: SheetHttpService,
        private activatedRoute: ActivatedRoute,
        private cheatMode: CheatModeService,
        public hintService: HintsService,
        private gameReplayService: GameReplayService,
    ) {}
    get isGameDone(): boolean {
        if (this.logic) return this.logic.isGameDone;
        return false;
    }
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
            this.gameReplayService,
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

    async reset() {
        await this.logic.start();
    }
    blink() {
        this.logic.cheat();
    }
    hint(delay = THREE_SECONDS) {
        if (this.hintService.blockClick || this.hintService.differences.toString() === [].toString()) return;
        this.socketService.send('hint', this.playerName);
        this.hintService.executeHint(this.playAreaContainer.nativeElement, delay);
        if (!this.gameReplayService.isReplay) {
            this.gameReplayService.events.push({
                type: 'hint',
                timestamp: Date.now(),
                data: this.playAreaContainer.nativeElement,
            });
        }
        setTimeout(() => {
            this.hintService.activateHint = false;
        }, delay);
    }
}
