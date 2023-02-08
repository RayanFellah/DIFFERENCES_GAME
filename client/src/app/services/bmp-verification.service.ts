import { Injectable } from '@angular/core';
import { DEFAULT_WIDTH, DEFAULT_HEIGHT, BPP } from '@app/classes/constants';
@Injectable({
    providedIn: 'root',
})
export class BmpVerificationService {
    verifyImage(image: File): boolean {
        const size = image.size;
        const width = DEFAULT_WIDTH;
        const height = DEFAULT_HEIGHT;
        const bitDepth = 24;
        const headerSize = 54;
        const bytesPerPixel = bitDepth / BPP;

        const expectedSize = headerSize + width * height * bytesPerPixel;
        return size === expectedSize;
    }
}
