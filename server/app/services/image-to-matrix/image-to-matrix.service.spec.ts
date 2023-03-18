import { ImageToMatrixService } from './image-to-matrix.service';
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
            const buffer = Buffer.from([1, 2, 3]);
            const image = new Jimp(2, 2);
            image.setPixelColor(0xff0000ff, 0, 0); // rouge
            image.setPixelColor(0x00ff00ff, 1, 0); // vert
            image.setPixelColor(0x0000ffff, 0, 1); // bleu
            image.setPixelColor(0xffffffff, 1, 1); // blanc
            jimpReadSpy.mockResolvedValue(image);
            service.setFile(buffer);

            const result = await service.imageToMatrix();

            expect(result).toEqual([
                [
                    [255, 0, 0, 255],
                    [0, 255, 0, 255],
                ],
                [
                    [0, 0, 255, 255],
                    [255, 255, 255, 255],
                ],
            ]);
            expect(jimpReadSpy).toHaveBeenCalledWith(buffer);
            expect(getPixelColorSpy).toHaveBeenCalledTimes(4);
        });

        it('should throw an error if there is a problem reading the image', async () => {
            const buffer = Buffer.from([1, 2, 3]);
            const error = new Error('Something went wrong');
            jimpReadSpy.mockRejectedValue(error);
            service.setFile(buffer);

            await expect(service.imageToMatrix()).rejects.toThrowError(error);
            expect(jimpReadSpy).toHaveBeenCalledWith(buffer);
        });
    });
});
