import { ImageToMatrixService } from './image-to-matrix.service';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import Jimp = require('jimp');

describe('ImageToMatrixService', () => {
    let service: ImageToMatrixService;

    beforeEach(() => {
        service = new ImageToMatrixService();
    });

    describe('setFile', () => {
        it('should set the file property', () => {
            const buffer = Buffer.from([1, 2, 3]);
            service.setFile(buffer);
            expect(service.file).toEqual(buffer);
        });
    });

    describe('imageToMatrix', () => {
        let jimpReadSpy: jest.SpyInstance;
        let getPixelColorSpy: jest.SpyInstance;

        beforeEach(() => {
            jimpReadSpy = jest.spyOn(Jimp, 'read');
            getPixelColorSpy = jest.spyOn(Jimp.prototype, 'getPixelColor');
        });

        afterEach(() => {
            jimpReadSpy.mockRestore();
            getPixelColorSpy.mockRestore();
        });

        it('should return a matrix representing the image', async () => {
            const red = 0xff0000ff;
            const green = 0x00ff00ff;
            const blue = 0x0000ffff;
            const white = 0xffffffff;
            const buffer = Buffer.from([1, 2, 3]);
            const image = new Jimp(2, 2);
            image.setPixelColor(red, 0, 0); // rouge
            image.setPixelColor(green, 1, 0); // vert
            image.setPixelColor(blue, 0, 1); // bleu
            image.setPixelColor(white, 1, 1); // blanc
            jimpReadSpy.mockResolvedValue(image);
            service.setFile(buffer);

            const result = await service.imageToMatrix();
            const pixelColor = 255;
            const times = 4;

            expect(result).toEqual([
                [
                    [pixelColor, 0, 0, pixelColor],
                    [0, pixelColor, 0, pixelColor],
                ],
                [
                    [0, 0, pixelColor, pixelColor],
                    [pixelColor, pixelColor, pixelColor, pixelColor],
                ],
            ]);
            expect(jimpReadSpy).toHaveBeenCalledWith(buffer);
            expect(getPixelColorSpy).toHaveBeenCalledTimes(times);
        });

        it('should throw an error if there is a problem reading the image', async () => {
            const buffer = Buffer.from([1, 2, 3]);
            const error = new Error('Something went wrong');
            jimpReadSpy.mockRejectedValue(error);
            service.setFile(buffer);

            await expect(service.imageToMatrix()).rejects.toThrowError(error);
            expect(jimpReadSpy).toHaveBeenCalledWith(buffer);
        });
        it('should throw an error if there is a problem getting pixel color', async () => {
            const buffer = Buffer.from([1, 2, 3]);
            const image = new Jimp(2, 2);
            jimpReadSpy.mockResolvedValue(image);
            getPixelColorSpy.mockImplementation(() => {
                throw new Error('Error getting pixel color');
            });
            service.setFile(buffer);

            await expect(service.imageToMatrix()).rejects.toThrowError('Error getting pixel color');
            expect(jimpReadSpy).toHaveBeenCalledWith(buffer);
        });
    });
});
