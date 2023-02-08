import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class BmpVerifierService {
    async verifyBitDepth(file: File): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onloadend = () => {
                const bmpArray = new Uint8Array(reader.result as ArrayBuffer);
                const bitDepth = bmpArray[30] + (bmpArray[31] << 8);
                resolve(bitDepth === 24);
            };
            reader.onerror = (error) => {
                reject(error);
            };
        });
    }
}
