import { TestBed } from '@angular/core/testing';

import { CanvasFormatterService } from './canvas-formatter.service';

describe('CanvasFormatterService', () => {
    let service: CanvasFormatterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CanvasFormatterService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
