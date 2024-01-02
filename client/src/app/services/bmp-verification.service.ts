import { Injectable } from '@angular/core';
import { BPP, HEIGHT, WIDTH } from 'src/constants';
@Injectable({
    providedIn: 'root',
})
export class BmpVerificationService {
    verifyImage(image: File): boolean {
        const size = image.size;
        const width = WIDTH;
        const height = HEIGHT;
        const bitDepth = 24;
        const headerSize = 54;
        const bytesPerPixel = bitDepth / BPP;

        const expectedSize = headerSize + width * height * bytesPerPixel;

        return size === expectedSize;
    }
}
