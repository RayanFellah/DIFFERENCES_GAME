/* eslint-disable max-params */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DialogComponent } from '@app/components/dialogue/dialog.component';
import { TimeLimitPlayGroundComponent } from '@app/components/time-limit-play-ground/time-limit-play-ground.component';
import { GameStateService } from '@app/services/game-state/game-state.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { TimeLimitModeService } from '@app/services/time-limit-mode.service';
import { TimerReplayService } from '@app/services/timer-replay/timer-replay.service';
import { GameConstants } from '@common/game-constants';
import { GameEvents } from '@common/game-events';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-limited-time-game-page',
    templateUrl: './limited-time-game-page.component.html',
    styleUrls: ['./limited-time-game-page.component.scss'],
    providers: [DialogComponent],
})
export class LimitedTimeGamePageComponent implements OnInit, OnDestroy {
    @ViewChild(TimeLimitPlayGroundComponent) playGround: TimeLimitPlayGroundComponent;
    timeLeft: number;
    gameType = 'TL';
    mode: string;
    playerName: string;
    opponent: string = '';
    roomName: string = 'room';
    constants: GameConstants;
    points: number;
    private unsubscribe$ = new Subject<void>();

    constructor(
        public gameLogic: TimeLimitModeService,
        private gameState: GameStateService,
        private router: Router,
        private timer: TimerReplayService,
        private socketClientService: SocketClientService,
        private readonly dialog: DialogComponent,
    ) {}
    get time() {
        return this.timer.elapsedTime;
    }
    ngOnInit() {
        if (!this.gameState.isGameInitialized) {
            this.router.navigate(['/main']);
        }
        this.socketClientService.send('getConstants');
        if (this.socketClientService.isSocketAlive()) this.handleResponses();
        this.timeLeft = this.gameLogic.timeLimit;
        this.playerName = this.gameLogic.player.name;
        this.roomName = this.gameLogic.playRoom.roomName;
        if (this.gameLogic.playRoom.player2)
            this.opponent =
                this.gameLogic.playRoom.player1.name === this.playerName
                    ? this.gameLogic.playRoom.player2.name
                    : this.gameLogic.playRoom.player1.name;
        this.mode = this.gameLogic.playRoom.mode;
    }
    handleResponses() {
        this.socketClientService
            .on<GameConstants>('gameConstants')
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((constants) => {
                if (!this.constants) {
                    this.constants = constants;
                    this.gameLogic.constants = constants;
                    if (this.constants) this.timer.startTimerLimitedTime(this.constants);
                }
            });

        this.socketClientService
            .on<string>(GameEvents.GameOver)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((message) => {
                const DELAY = 50;
                setTimeout(() => {
                    this.dialog.openGameOverDialog({ message, isClassicGame: false });
                }, DELAY);
            });

        this.socketClientService
            .on(GameEvents.playerLeft)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => {
                this.opponent = '';
                this.mode = 'LimitedTimeSolo';
            });
    }

    ngOnDestroy(): void {
        this.gameLogic.cleanup();
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        location.reload();
    }
}
