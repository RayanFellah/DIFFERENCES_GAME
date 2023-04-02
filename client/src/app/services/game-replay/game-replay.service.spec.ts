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
});
