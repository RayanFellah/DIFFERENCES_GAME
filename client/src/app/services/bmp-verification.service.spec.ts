import { TestBed } from '@angular/core/testing';

import { BmpVerificationService } from './bmp-verification.service';

describe('BmpVerificationService', () => {
    let service: BmpVerificationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [BmpVerificationService],
        });
        service = TestBed.inject(BmpVerificationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('verifyImage', () => {
        it('should return true if the size of the image matches the expected size', () => {
            const file = new File([''], 'test.bmp', { type: 'image/bmp' });
            const result = service.verifyImage(file);
            expect(result).toBeTrue();
        });

        it('should return false if the size of the image does not match the expected size', () => {
            const size = 100; // desired size in bytes
            const blob = new Blob([new ArrayBuffer(size)], { type: 'image/bmp' });
            const file = new File([blob], 'test.bmp', { type: 'image/bmp' });
            const result = service.verifyImage(file);
            expect(result).toBeFalse();
        });
    });
});
