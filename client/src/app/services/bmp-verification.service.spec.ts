import { TestBed } from '@angular/core/testing';

import { BmpVerificationService } from './bmp-verification.service';

describe('BmpVerificationService', () => {
    let service: BmpVerificationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(BmpVerificationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
