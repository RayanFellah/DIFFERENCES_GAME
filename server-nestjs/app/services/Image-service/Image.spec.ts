import { ImageService } from './image.service';

describe('ImageService', () => {
    let imageService: ImageService;

    beforeEach(() => {
        imageService = new ImageService('app/services/Image-service/imageStubs/img1.png');
    });

    describe('loadImage', () => {
        it('should load the image and return a Jimp image object', async () => {
            const image = await imageService.loadImage();
            expect(image).toBeDefined();
            expect(typeof image).toBe('object');
        });
    });

    describe('imageToMatrix', () => {
        it('should convert the loaded image to a matrix of pixel values', async () => {
            const matrix = await imageService.imageToMatrix();
            expect(matrix).toBeDefined();
            expect(Array.isArray(matrix)).toBe(true);

            // Check that the matrix has the expected dimensions
            const height = await imageService.image.getHeight();
            const width = await imageService.image.getWidth();
            expect(matrix.length).toBe(height);
            expect(matrix[0].length).toBe(width);

            // Check that the matrix contains the expected pixel values
            const color = await imageService.image.getPixelColor(0, 0);
            const r = (color >> 24) & 0xff;
            const g = (color >> 16) & 0xff;
            const b = (color >> 8) & 0xff;
            const a = color & 0xff;
            expect(matrix[0][0]).toEqual([r, g, b, a]);
        });
    });
});
