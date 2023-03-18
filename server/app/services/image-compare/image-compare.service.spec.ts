// import { ImageCompareService } from './image-compare.service';

// describe('ImageCompareService', () => {
//     let service: ImageCompareService;

//     beforeEach(() => {
//         service = new ImageCompareService();
//     });

//     describe('compareImages', () => {
//         const originalImagePath = { buffer: Buffer.from(''), mimetype: 'image/jpeg' } as Express.Multer.File;
//         const modifiedImagePath = { buffer: Buffer.from(''), mimetype: 'image/jpeg' } as Express.Multer.File;
//         const radius = '10';

//         it('should return an object with differences, imageBase64, and difficulty properties', async () => {
//             const result = await service.compareImages(originalImagePath, modifiedImagePath, radius);
//             expect(result).toHaveProperty('differences');
//             expect(result).toHaveProperty('imageBase64');
//             expect(result).toHaveProperty('difficulty');
//         });

//         it('should return the correct number of differences', async () => {
//             // You can create mocked instances of the dependencies to return specific values
//             const mockDifferenceDetector = {
//                 getAllClusters: jest.fn().mockResolvedValue([{ coords: [{ posX: 1, posY: 1 }] }]),
//             };
//             jest.spyOn(service as any, 'createDifferenceDetector').mockReturnValue(mockDifferenceDetector);

//             const result = await service.compareImages(originalImagePath, modifiedImagePath, radius);
//             expect(result.differences).toEqual(1);
//         });

//         it('should return the correct imageBase64 value', async () => {
//             const mockImage = { getBufferAsync: jest.fn().mockResolvedValue(Buffer.from('image buffer')) };
//             jest.spyOn(service as any, 'createJimpImage').mockReturnValue(mockImage);

//             const result = await service.compareImages(originalImagePath, modifiedImagePath, radius);
//             expect(result.imageBase64).toEqual(Buffer.from('image buffer').toString('base64'));
//         });

//         it('should return the correct difficulty level', async () => {
//             const mockDifferenceDetector = {
//                 getAllClusters: jest.fn().mockResolvedValue([{ coords: [{ posX: 1, posY: 1 }] }]),
//                 getDifficultyLevel: jest.fn().mockResolvedValue('Easy'),
//             };
//             jest.spyOn(service as any, 'createDifferenceDetector').mockReturnValue(mockDifferenceDetector);

//             const result = await service.compareImages(originalImagePath, modifiedImagePath, radius);
//             expect(result.difficulty).toEqual('Easy');
//         });

//         it('should return an error message if an error occurs', async () => {
//             jest.spyOn(service as any, 'createDifferenceDetector').mockImplementation(() => {
//                 throw new Error('Failed to create DifferenceDetector');
//             });

//             const result = await service.compareImages(originalImagePath, modifiedImagePath, radius);
//             expect(result).toEqual('Failed to create DifferenceDetector');
//         });
//     });
// });
