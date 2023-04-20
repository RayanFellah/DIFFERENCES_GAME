/* eslint-disable max-params */
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { HintsService } from '@app/services/hints.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { TimeLimitModeService } from '@app/services/time-limit-mode.service';
import { TimerReplayService } from '@app/services/timer-replay/timer-replay.service';
import { GameConstants } from '@common/game-constants';
import { HEIGHT, ONE_SECOND, WIDTH } from 'src/constants';

@Component({
    selector: 'app-time-limit-play-ground',
    templateUrl: './time-limit-play-ground.component.html',
    styleUrls: ['./time-limit-play-ground.component.scss'],
    providers: [],
})
export class TimeLimitPlayGroundComponent implements AfterViewInit, OnDestroy {
    @Input() constants: GameConstants;
    @Input() isSolo: boolean = true;
    @ViewChild('canvas1', { static: false }) private canvas1!: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas2', { static: false }) private canvas2!: ElementRef<HTMLCanvasElement>;
    @ViewChild('playAreaContainer', { static: false }) private playAreaContainer!: ElementRef<HTMLDivElement>;

    private canvasSize = { x: WIDTH, y: HEIGHT };
    constructor(
        private gameLogic: TimeLimitModeService,
        private _hintService: HintsService,
        private socketService: SocketClientService,
        private timer: TimerReplayService,
    ) {}

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }
    get hintService() {
        return this._hintService;
    }
    ngAfterViewInit() {
        this.gameLogic.bindCanvasRefs(this.canvas1.nativeElement, this.canvas2.nativeElement);
        this.gameLogic.drawOnCanvas();
    }

    handleClick(event: MouseEvent) {
        this.gameLogic.sendClick(event);
    }
    hint() {
        if (this.hintService.blockClick || this.hintService.differences.toString() === [].toString() || !this.isSolo) return;
        this.socketService.send('hint', 'a');
        this.timer.addPenaltyTime(this.constants);
        this.hintService.executeHint(this.playAreaContainer.nativeElement, ONE_SECOND);
        setTimeout(() => {
            this.hintService.activateHint = false;
        }, ONE_SECOND);
    }
    ngOnDestroy() {
        if (this.socketService.isSocketAlive()) this.socketService.disconnect();
    }
}
