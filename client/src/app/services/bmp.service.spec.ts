import { TestBed } from '@angular/core/testing';

import { BmpVerifierServiceService } from './bmp-verifier-service.service';

describe('BmpVerifierServiceService', () => {
    let service: BmpVerifierServiceService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(BmpVerifierServiceService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
