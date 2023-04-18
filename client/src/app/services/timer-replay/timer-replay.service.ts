import { Injectable } from '@angular/core';
import { GameConstants } from '@common/game-constants';
import { ONE_MINUTE, ONE_SECOND } from 'src/constants';

@Injectable({
    providedIn: 'root',
})
export class TimerReplayService {
    private _elapsedTime = 0;
    private _timerId: number | undefined;
    private _speed = 1;

    get elapsedTime(): string {
        const minutes = Math.floor(this._elapsedTime / ONE_MINUTE);
        const seconds = this._elapsedTime % ONE_MINUTE;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    get speed(): number {
        return this._speed;
    }

    set speed(value: number) {
        this._speed = value;
    }

    startTimer(): void {
        this._timerId = window.setInterval(() => {
            this._elapsedTime += this._speed;
        }, ONE_SECOND);
    }
    startTimerLimitedTime(startTimer: GameConstants) {
        this._elapsedTime = startTimer.gameTime;
        this._timerId = window.setInterval(() => {
            this._elapsedTime -= 1;
            if (this._elapsedTime <= 0) {
                this._elapsedTime = 0;
                window.clearInterval(this._timerId); // Stop the timer when it reaches 0
            }
        }, ONE_SECOND);
    }

    addpenaltyTime(penalty: GameConstants): void {
        this._elapsedTime -= penalty.gamePenalty;
        if (this._elapsedTime < 0) {
            this._elapsedTime = 0; // Set the elapsed time to 0 if it goes below 0
        }
    }

    addTimerBonus(bonus: GameConstants): void {
        this._elapsedTime += bonus.gameBonus;
    }
    stopTimer(): void {
        if (this._timerId !== undefined) {
            clearInterval(this._timerId);
            this._timerId = undefined;
        }
    }

    resetTimer(): void {
        this.stopTimer();
        this._elapsedTime = 0;
    }

    addTime(time: number): void {
        this._elapsedTime += time;
    }
}
