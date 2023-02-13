import { Component, OnInit } from '@angular/core';
import { TimerService } from '../../services/timer.service';

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnInit {
    minutes: number;
    seconds: number;

    constructor(private timerService: TimerService) {}

    ngOnInit() {
        this.timerService.start();
        setInterval(() => {
            this.minutes = this.timerService.getMinutes();
            this.seconds = this.timerService.getSeconds();
        }, 1000);
    }
}
