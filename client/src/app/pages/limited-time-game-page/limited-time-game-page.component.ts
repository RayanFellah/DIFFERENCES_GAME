import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameStateService } from '@app/services/game-state/game-state.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { TimeLimitModeService } from '@app/services/time-limit-mode.service';
import { TimerReplayService } from '@app/services/timer-replay/timer-replay.service';
import { GameConstants } from '@common/game-constants';

@Component({
    selector: 'app-limited-time-game-page',
    templateUrl: './limited-time-game-page.component.html',
    styleUrls: ['./limited-time-game-page.component.scss'],
})
export class LimitedTimeGamePageComponent implements OnInit, OnDestroy {
    timeLeft: number;
    gameType = 'TL';
    playerName: string;
    opponent: string = '';
    roomName: string = 'room';
    constants: GameConstants;
    points: number;
    constructor(
        public gameLogic: TimeLimitModeService,
        private gameState: GameStateService,
        private router: Router,
        private timer: TimerReplayService,
        private socketService: SocketClientService,
    ) {}
    get time() {
        return this.timer.elapsedTime;
    }
    ngOnInit() {
        if (!this.gameState.isGameInitialized) {
            this.router.navigate(['/main']);
        }
        this.socketService.send('getConstants');
        if (this.socketService.isSocketAlive()) this.handleResponses();
        this.timeLeft = this.gameLogic.timeLimit;
        this.playerName = this.gameLogic.player.name;
        this.roomName = this.gameLogic.playRoom.roomName;
        if (this.gameLogic.playRoom.player2)
            this.opponent =
                this.gameLogic.playRoom.player1.name === this.playerName
                    ? this.gameLogic.playRoom.player2.name
                    : this.gameLogic.playRoom.player1.name;
    }
    handleResponses() {
        this.socketService.on('gameConstants', (constants: GameConstants) => {
            this.constants = constants;
            this.gameLogic.constants = constants;
            if (this.constants) this.timer.startTimerLimitedTime(this.constants);
        });
    }

    ngOnDestroy(): void {
        location.reload();
    }
}
