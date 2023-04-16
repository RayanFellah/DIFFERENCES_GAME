import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameStateService } from '@app/services/game-state/game-state.service';
import { TimeLimitModeService } from '@app/services/time-limit-mode.service';

@Component({
    selector: 'app-limited-time-game-page',
    templateUrl: './limited-time-game-page.component.html',
    styleUrls: ['./limited-time-game-page.component.scss'],
})
export class LimitedTimeGamePageComponent implements OnInit, OnDestroy {
    timeLeft: number;
    gameType = 'TL';
    playerName: string;
    opponent: string = 'opp';
    roomName: string = 'room';
    constructor(public gameLogic: TimeLimitModeService, private gameState: GameStateService, private router: Router) {}
    ngOnInit() {
        if (!this.gameState.isGameInitialized) {
            this.router.navigate(['/main']);
        }
        this.timeLeft = this.gameLogic.timeLimit;
        this.playerName = this.gameLogic.player.name;
        this.roomName = this.gameLogic.playRoom.roomName;
    }
    ngOnDestroy(): void {
        location.reload();
    }
}
