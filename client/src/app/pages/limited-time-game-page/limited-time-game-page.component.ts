import { Component } from '@angular/core';
import { TimeLimitModeService } from '@app/services/time-limit-mode.service';

@Component({
    selector: 'app-limited-time-game-page',
    templateUrl: './limited-time-game-page.component.html',
    styleUrls: ['./limited-time-game-page.component.scss'],
})
export class LimitedTimeGamePageComponent {
    timeLeft: number;
    constructor(public gameLogic: TimeLimitModeService) {
        this.timeLeft = this.gameLogic.timeLimit;
    }
}
