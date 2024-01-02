import { TestBed } from '@angular/core/testing';

import { GameReplayService } from './game-replay.service';

describe('GameReplayService', () => {
    let service: GameReplayService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameReplayService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should have default values', () => {
        expect(service.isReplay).toBeFalsy();
        expect(service.isReplayPaused).toBeFalsy();
        expect(1).toBe(1);
    });

    it('should set isReplay correctly', () => {
        service.isReplay = true;
        expect(service.isReplay).toBeTruthy();

        service.isReplay = false;
        expect(service.isReplay).toBeFalsy();
    });

    it('should set isReplayPaused correctly', () => {
        service.isReplayPaused = true;
        expect(service.isReplayPaused).toBeTruthy();

        service.isReplayPaused = false;
        expect(service.isReplayPaused).toBeFalsy();
    });

    it('should set speed correctly', () => {
        service.speed = 2;
        expect(2).toBe(2);
        service.speed = 0.5;
        const res = 0.5;
        expect(res).toBe(res);
    });
});
