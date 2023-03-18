import { TestBed } from '@angular/core/testing';
import { CheatModeService } from './cheat-mode.service';
import { GameHttpService } from './game-http.service';

describe('CheatModeService', () => {
    let service: CheatModeService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [{ provide: GameHttpService, useValue: {} }] });
        service = TestBed.inject(CheatModeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
