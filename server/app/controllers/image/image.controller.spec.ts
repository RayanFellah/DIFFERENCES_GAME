import { ImageCompareService } from '@app/services/image-compare/image-compare.service';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { ImageController } from './image.controller';
describe('ImageController', () => {
    let controller: ImageController;
    let tempImagePath: string;
    beforeAll(() => {
        const tempDir = path.join(process.cwd(), 'uploads');

        const tempImage = Buffer.from('test image');
        tempImagePath = path.join(tempDir, 'test.jpg');
        fs.writeFileSync(tempImagePath, tempImage);
    });

    afterAll(() => {
        fs.unlinkSync(tempImagePath);
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ImageController],
        }).compile();

        controller = module.get<ImageController>(ImageController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('serveImage', () => {
        it('should return an image when the file exists', async () => {
            const filename = 'test.jpg';
            const imagePath = path.join(process.cwd(), 'uploads', filename);
            const res = {
                sendFile: jest.fn(),
            } as unknown as jest.Mocked<Response>;

            await controller.serveImage(filename, res);
            expect(path.relative(res.sendFile.mock.calls[0][0], imagePath)).toBe('');
        });
        it('should throw NotFoundException when the file does not exist', async () => {
            const filename = 'nonexistent.jpg';
            const res = {
                sendFile: jest.fn(),
            } as unknown as jest.Mocked<Response>;

            try {
                await controller.serveImage(filename, res);
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundException);
                expect(e.message).toBe('Example not found');
            }
        });

        // ... other tests
    });

    describe('compareImages', () => {
        it('should return comparison results', async () => {
            const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVQI12P4z8AAAAMBAQAY3Y2wAAAAAElFTkSuQmCC';
            const bufferImage = Buffer.from(base64Image, 'base64');

            const mockFile: Express.Multer.File = {
                fieldname: 'testfile',
                originalname: 'test.png',
                encoding: '7bit',
                mimetype: 'image/png',
                buffer: bufferImage,
                size: bufferImage.length,
                destination: '',
                filename: '',
                path: '',
                stream: null,
            };

            const formData = { radius: 20 };
            const files = {
                originalImagePath: [mockFile],
                modifiedImagePath: [mockFile],
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;

            const mockResponse = {
                differences: 3,
                imageBase64: 'data:image/png;base64,' + base64Image,
                difficulty: 'easy',
            };

            jest.spyOn(ImageCompareService.prototype, 'compareImages').mockResolvedValue(mockResponse);

            await controller.compareImages(formData, files, res);
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(mockResponse);
        });

        // ... other tests
    });
});
