import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    private timer: any;
    private elapsedTime: number;

    start() {
        const startTime = new Date().getTime();
        this.timer = setInterval(() => {
            const currentTime = new Date().getTime();
            this.elapsedTime = (currentTime - startTime) / 1000;
            const minutes = Math.floor(this.elapsedTime / 60);
            const seconds = Math.floor(this.elapsedTime % 60);
            console.log(minutes + ' minutes and ' + seconds + ' seconds have passed.');
            if (this.getSeconds() === 2) {
            }
        }, 1000);
    }

    stop() {
        clearInterval(this.timer);
        this.elapsedTime = 0;
        console.log(this.elapsedTime);
    }

    getSeconds() {
        return Math.floor(this.elapsedTime % 60);
    }

    getMinutes() {
        return Math.floor(this.elapsedTime / 60);
    }
}
