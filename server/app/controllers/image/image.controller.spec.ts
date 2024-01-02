/* eslint-disable @typescript-eslint/no-empty-function */
import { Test, TestingModule } from '@nestjs/testing';
import { ImageController } from './image.controller';
describe('ImageController', () => {
    let controller: ImageController;
    beforeAll(() => {});

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ImageController],
        }).compile();

        controller = module.get<ImageController>(ImageController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
