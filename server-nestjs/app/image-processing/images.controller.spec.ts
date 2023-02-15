import { GameLogicService } from '@app/game-logic/game-logic.service';
import { SheetService } from '@app/model/database/Sheets/sheet.service';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ImageStorageService } from './image-storage.service';
import { ImagesController } from './images.controller';

describe('ImagesController', () => {
    let controller: ImagesController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ImagesController],
        }).compile();

        controller = module.get<ImagesController>(ImagesController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});



describe('ImagesController', () => {
  let controller: ImagesController;
  let imageStorageService: ImageStorageService;
  let gameLogicService: GameLogicService;
  let sheetService: SheetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImagesController],
      providers: [ImageStorageService, GameLogicService, SheetService],
    }).compile();

    controller = module.get<ImagesController>(ImagesController);
    imageStorageService = module.get<ImageStorageService>(ImageStorageService);
    gameLogicService = module.get<GameLogicService>(GameLogicService);
    sheetService = module.get<SheetService>(SheetService);
  });

  describe('test', () => {
    it('should return "ServerIsClean"', async () => {
      const result = await controller.test();
      expect(result).toBe('ServerIsClean');
    });
  });

  describe('uploadFile', () => {
    it('should return 201 status code and valid response when uploading a valid file', async () => {
      // Set up test data
      const originalImageBuffer = Buffer.from('originalImageBuffer');
      const modifiedImageBuffer = Buffer.from('modifiedImageBuffer');
      const valid = 'true';
      const radius = '10';
      const title = 'test title';
      jest.spyOn(imageStorageService, 'uploadImage').mockImplementation(async (buffer, sheetId, originalName, isOriginal) => {
        return {
          path: `test/${sheetId}`,
        };
      });
      jest.spyOn(sheetService, 'createSheet').mockImplementation(async () => {});

      // Make request to controller
      const response = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
      await controller.uploadFile(
        {
          original: [
            {
              buffer: originalImageBuffer,
              originalname: 'original.jpg',
            },
          ],
          modified: [
            {
              buffer: modifiedImageBuffer,
              originalname: 'modified.jpg',
            },
          ],
        },
        response as any,
        valid,
        radius,
        title,
      );

      // Check the response
      expect(response.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(response.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'files have been uploaded',
          differences: expect.any(Number),
          isValid: true,
          gameId: expect.any(String),
        }),
      );
    });

    it('should return 400 status code when failing to upload a file', async () => {
      // Set up test data
      jest.spyOn(imageStorageService, 'uploadImage').mockImplementation(async () => {
        throw new Error();
      });

      // Make request to controller
      const response = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
      await controller.uploadFile(
        {
          original: [
            {
              buffer: Buffer.from('originalImageBuffer'),
              originalname: 'original.jpg',
            },
          ],
          modified: [
            {
              buffer: Buffer.from('modifiedImageBuffer'),
              originalname: 'modified.jpg


            });

            describe('getImagePath', () => {
                it('should return the path of an image when given a sheetId and a boolean', async () => {
                    const result = await service.getImagePath('testid', true);
                    expect(result).toEqual('original/testid.jpg');
                });
            });
            
            describe('uploadImage', () => {
                it('should upload an image to the server', async () => {
                    const buffer = Buffer.from('image data');
                    const sheetId = 'testid';
                    const originalname = 'testname.jpg';
                    const nature = true;
                    const result = await service.uploadImage(buffer, sheetId, originalname, nature);
                    expect(result.path).toEqual(`original/${sheetId}.jpg`);
                });
            });
            
            describe('deleteImage', () => {
                it('should delete an existing image', async () => {
                    service.dataPath = pathStub;
                    const images = await service.getAllImages();
                    const imageToDelete = images[0];
                    await service.deleteImage(imageToDelete.id);
                    const result = await service.findImageById(imageToDelete.id);
                    expect(result).toBeUndefined();
                });
            });