import { Injectable } from '@angular/core';
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
