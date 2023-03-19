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

    describe('verifyImage', () => {
        it('should return true for an Invalid BMP image', () => {
            const file = new File([''], 'test.bmp', { type: 'image/bmp' });
            expect(service.verifyImage(file)).toBeFalse();
        });

        it('should return false for a non BMP image', () => {
            const file = new File([''], 'test.bmp', { type: 'image/png' });
            expect(service.verifyImage(file)).toBeFalse();
        });
    });
});
