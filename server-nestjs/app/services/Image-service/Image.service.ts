import { Injectable } from '@nestjs/common';
const Jimp = require('jimp');
Injectable();
export class ImageService {
    path: string;
    image;

    constructor(pathImage: string) {
        this.path = pathImage;
    }

    async loadImage() {
        this.image = await Jimp.read(this.path);
        return await this.image;
    }
    async imageToMatrix() {
        try {
            // Loading the image
            await this.loadImage();

            // Initializing the matrix
            const matrix: Array<Array<Array<number>>> = new Array(this.image.getHeight());

            // Filling the matrix with the pixel values
            for (let y = 0; y < this.image.getHeight(); y++) {
                matrix[y] = new Array(this.image.getWidth());
                for (let x = 0; x < this.image.getWidth(); x++) {
                    const color = this.image.getPixelColor(x, y);
                    const r = (color >> 24) & 0xff;
                    const g = (color >> 16) & 0xff;
                    const b = (color >> 8) & 0xff;
                    const a = color & 0xff;
                    matrix[y][x] = [r, g, b, a];
                }
            }
            return matrix;
        } catch (err) {
            console.log(err);
        }
    }
}
