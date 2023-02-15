import { Test, TestingModule } from '@nestjs/testing';
import { ImageStorageService } from './image-storage.service';

describe('ImageStorageService', () => {
    let service: ImageStorageService;
    const pathStub: string = 'app/image-processing/imagesproc/data/imagestest.json';

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ImageStorageService],
        }).compile();

        service = module.get<ImageStorageService>(ImageStorageService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getAllImages', () => {
        it('should return an array of ImageDto', async () => {
            service.dataPath = pathStub;
            const result = await service.getAllImages();
            expect(result).toBeInstanceOf(Array);
        });
    });

    describe('findImageById', () => {
        it('should return an ImageDto when given an id that exists', async () => {
            service.dataPath = pathStub;
            const images = await service.getAllImages();
            const result = await service.findImageById(images[1].id);
        });

        it('should return undefined when given an id that does not exist', async () => {
            service.dataPath = pathStub;
            const result = await service.findImageById('nonexistentid');
            expect(result).toBeUndefined();
        });
    });

    describe('updateImage', () => {
        it('should update an existing image', async () => {
            service.dataPath = pathStub;
            const images = await service.getAllImages();
            const imageToUpdate = images[2];
            const updatedImage = { ...imageToUpdate, name: 'newname.jpg' };
            await service.updateImage(updatedImage);
            const result = await service.findImageById(imageToUpdate.id);
            expect(result.name).toEqual('newname.jpg');
        });
    });

    describe('uploadImage', () => {
        it('should upload an image and return an ImageDto', async () => {
            const imageBuffer = Buffer.from('fakeimage');
            const sheetToAdd = 'sheetid';
            const filename = 'test.jpg';
            const isOriginal = true;
            const result = await service.uploadImage(imageBuffer, sheetToAdd, filename, isOriginal);
            expect(result).toBeTruthy();
        });
        it('should throw an error if failed', async () => {
            const imageBuffer = undefined;
            const sheetToAdd = 'sheetid';
            const filename = 'test.jpg';
            const isOriginal = true;
            const result = await service.uploadImage(imageBuffer, sheetToAdd, filename, isOriginal);
            expect(result).toEqual(new Error('Upload-Failed'));
        });
    });

    describe('deleteImage', () => {
        it('should delete an existing image', async () => {
            service.dataPath = pathStub;
            const images = await service.getAllImages();
            const imageToDelete = images[3];
            await service.deleteImage(imageToDelete.id);
            const result = await service.findImageById(imageToDelete.id);
            expect(result).toBeUndefined();
        });
    });

    describe('getSheetId', () => {
        it('should return the sheet id of an image', async () => {
            service.dataPath = pathStub;
            const images = await service.getAllImages();
            const result = await service.getSheetId(images[4].id);
            expect(result).toBe(images[4].sheetId);
        });
    });

    describe('getImagePathFromId', () => {
        it('should return the path of an image', async () => {
            service.dataPath = pathStub;
            const images = await service.getAllImages();
            const result = await service.getImagePathFromId(images[5].id);
            expect(result).toBe(images[5].path);
        });

        it('getImagePath to return name of the image', async () => {
            service.dataPath = pathStub;
            const images = await service.getAllImages();
            const result = await service.getImagePath(images[5].sheetId, true);
            expect(result).toBe(images[5].name);
        });

        it('getImagePath to return undefined', async () => {
            service.dataPath = pathStub;
            const images = await service.getAllImages();
            const result = await service.getImagePath(null, true);
            expect(result).toBeFalsy();
        });
    });

    describe('deleteImage', () => {
        it('should delete an existing image', async () => {
            service.dataPath = pathStub;
            const images = await service.getAllImages();
            const imageToDelete = images[3];
            await service.deleteImage(imageToDelete.id);
            const result = await service.findImageById(imageToDelete.id);
            expect(result).toBeUndefined();
        });
    });
});
