import { TestBed } from '@angular/core/testing';

import { HttpClient } from '@angular/common/http';
import { AudioService } from './audio.service';
import { GameHttpService } from './game-http.service';
import { HintsService } from './hints.service';

describe('HintsService', () => {
    let service: HintsService;
    const gameHttp = jasmine.createSpyObj('GameHttpService', ['getHint']);
    const audio = jasmine.createSpyObj('AudioService', ['playHintSound']);

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                HintsService,
                { provide: GameHttpService, useValue: gameHttp },
                { provide: AudioService, useValue: audio },
                { provide: HttpClient, useValue: {} },
            ],
        });
        service = TestBed.inject(HintsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
