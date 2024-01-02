import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { GameConstants } from '@common/game-constants';
import { TimerReplayService } from './timer-replay.service';

describe('TimerReplayService', () => {
    let service: TimerReplayService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TimerReplayService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should return the elapsed time in the format mm:ss', () => {
        service['_elapsedTime'] = 60;
        expect(service.elapsedTime).toEqual('01:00');
    });

    it('should return the speed', () => {
        service['_speed'] = 1;
        expect(service.speed).toEqual(1);
    });
    it('should set the speed', () => {
        service.speed = 1;
        expect(service.speed).toEqual(1);
    });
    it('should start the timer', () => {
        spyOn(window, 'setInterval').and.callThrough();
        service.startTimer();
        expect(window.setInterval).toHaveBeenCalled();
    });
    it('should start the timer with limited time', () => {
        spyOn(window, 'setInterval').and.callThrough();
        service.startTimerLimitedTime({ gameTime: 30, gamePenalty: 5, gameBonus: 5 });
        expect(window.setInterval).toHaveBeenCalled();
    });

    it('startTimer should start the timer with limited time', fakeAsync(() => {
        const startTimer = { gameTime: 3, gamePenalty: 5, gameBonus: 5 };
        spyOn(window, 'clearInterval').and.callThrough();
        service.startTimerLimitedTime(startTimer as GameConstants);
        expect(service.timeDone.getValue()).toBeFalse();
        expect(service.elapsedTime).toBe('00:03');
        const time = 1000;
        tick(time);
        expect(service.timeDone.getValue()).toBeFalse();
        expect(service.elapsedTime).toBe('00:02');
        const time2 = 2000;
        tick(time2);
        expect(service.timeDone.getValue()).toBeTrue();
        expect(service.elapsedTime).toBe('00:00');
        expect(window.clearInterval).toHaveBeenCalled();
    }));
    it('addpenaltyTime should add penalty time to the elapsed time', () => {
        service['_elapsedTime'] = 30;
        service.addPenaltyTime({ gameTime: 30, gamePenalty: 5, gameBonus: 5 });
        expect(service.elapsedTime).toEqual('00:25');
    });
    it('addTimerBonus should add bonus time to the elapsed time', () => {
        service['_elapsedTime'] = 30;
        service.addTimerBonus({ gameTime: 30, gamePenalty: 5, gameBonus: 5 });
        expect(service.elapsedTime).toEqual('00:35');
    });
    it('stopTimer should stop the timer', () => {
        spyOn(window, 'clearInterval').and.callThrough();
        service.startTimer();
        service.stopTimer();
        expect(window.clearInterval).toHaveBeenCalled();
    });
    it('resetTimer should reset the timer', () => {
        service.startTimer();
        service.resetTimer();
        expect(service['_elapsedTime']).toEqual(0);
    });
    it('addTime should add time to the elapsed time', () => {
        const timeAdded = 10;
        service.addTime(timeAdded);
        expect(service.elapsedTime).toEqual('00:10');
    });
});
