import { Test, TestingModule } from '@nestjs/testing';
import { ImageService } from './Image.service';
const Jimp = require('jimp');
describe('testing the Image component', () => {
    let service: ImageService;
    let imagePathStub: String = 'app/services/Image-service/imageStubs/img1.png';
    let jimpStub;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ImageService, { provide: String, useValue: imagePathStub }],
        }).compile();

        service = module.get<ImageService>(ImageService);
    });
    it('loadImage should correctly load the image', async () => {
        const loadedImage = await service.loadImage(imagePathStub);
        expect(loadedImage).toBeTruthy();
    });
    it('imageToMatrix should call loadImage', async () => {
        jimpStub = await Jimp.read(imagePathStub);
        const spy = jest.spyOn(service, 'loadImage').mockImplementationOnce(async (imagePathStub) => {
            return jimpStub;
        });
        await service.imageToMatrix();
        expect(spy).toHaveBeenCalled();
    });
    it('imageToMatrix should return the right rgb colors associated with all the pixels', async () => {
        jimpStub = await Jimp.read(imagePathStub);
        const arrayDimension = 2;

        const spy = jest.spyOn(service, 'loadImage').mockImplementationOnce(async (imagePathStub) => {
            return jimpStub;
        });
        const matrix = await service.imageToMatrix();

        const RGBset = new Set(matrix.flat(arrayDimension));
        console.log(RGBset);
        expect(RGBset.size).toEqual(1);
        expect(RGBset[0]).toEqual(255);
    });
});
