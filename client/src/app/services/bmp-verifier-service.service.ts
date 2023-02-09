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
                if (bitDepth === 24) {
                    resolve(true);
                } else {
                    alert("Cette image n'est pas un bmp 24-bit");
                    // eslint-disable-next-line no-console
                    console.log('allo');
                    resolve(false);
                }
            };
            reader.onerror = (error) => {
                reject(error);
            };
        });
    }
}
