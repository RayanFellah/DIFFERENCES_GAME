import { Injectable } from '@angular/core';
import { GameEvents } from '@app/interfaces/game-events';
import { TimerReplayService } from '@app/services/timer-replay/timer-replay.service';

@Injectable({
    providedIn: 'root',
})
export class GameReplayService {
    events: GameEvents[] = [];
    isLastHint = false;
    private _isReplay = false;
    private _isReplayPaused = false;

    constructor(private readonly timer: TimerReplayService) {}

    get isReplay() {
        return this._isReplay;
    }
    get isReplayPaused() {
        return this._isReplayPaused;
    }
    get elapsedTime() {
        return this.timer.elapsedTime;
    }
    set isReplayPaused(isReplayPaused: boolean) {
        this._isReplayPaused = isReplayPaused;
    }
    set isReplay(isReplay: boolean) {
        this._isReplay = isReplay;
    }
    set speed(speed: number) {
        this.timer.speed = speed;
    }
    startTimer() {
        this.timer.startTimer();
    }
    stopTimer() {
        this.timer.stopTimer();
    }
    resetTimer() {
        this.timer.resetTimer();
    }
    addTime(time: number) {
        this.timer.addTime(time);
    }
}
