/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-bitwise */
import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import Jimp = require('jimp');
@Injectable()
export class ImageToMatrixService {
    file: Buffer;
    setFile(file: Buffer) {
        this.file = file;
    }
    async imageToMatrix() {
        const image = await Jimp.read(this.file);
        try {
            // Initializing the matrix
            const matrix: number[][][] = new Array(image.getHeight());

            // Filling the matrix with the pixel values
            for (let y = 0; y < image.getHeight(); y++) {
                matrix[y] = new Array(image.getWidth());
                for (let x = 0; x < image.getWidth(); x++) {
                    const color = image.getPixelColor(x, y);
                    const r = (color >> 24) & 0xff;
                    const g = (color >> 16) & 0xff;
                    const b = (color >> 8) & 0xff;
                    const a = color & 0xff;
                    matrix[y][x] = [r, g, b, a];
                }
            }
            return matrix;
        } catch (err) {
            throw new Error(err);
        }
    }
}
