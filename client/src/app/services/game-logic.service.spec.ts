import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { CanvasHelperService } from './canvas-helper.service';
import { CheatModeService } from './cheat-mode.service';

import { GameLogicService } from './game-logic.service';
import { ImageHttpService } from './image-http.service';
import { SheetHttpService } from './sheet-http.service';

describe('GameLogicService', () => {
    let service: GameLogicService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: CanvasHelperService, useValue: {} },
                { provide: ImageHttpService, useValue: {} },
                { provide: ActivatedRoute, useValue: {} },
                { provide: SheetHttpService, useValue: {} },
                { provide: CheatModeService, useValue: {} },
            ],
        });
        service = TestBed.inject(GameLogicService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
