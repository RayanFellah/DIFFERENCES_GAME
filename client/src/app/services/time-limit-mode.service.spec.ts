import { TestBed } from '@angular/core/testing';

import { TimeLimitModeService } from './time-limit-mode.service';

describe('TimeLimitModeService', () => {
    let service: TimeLimitModeService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TimeLimitModeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
