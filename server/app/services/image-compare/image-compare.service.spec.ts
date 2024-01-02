/* eslint-disable @typescript-eslint/no-explicit-any */
import { DifferenceDetectorService } from '@app/services/difference-detector/difference-detector.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ImageCompareService } from './image-compare.service';

jest.mock('@app/services/image-to-matrix/image-to-matrix.service');

describe('ImageCompareService', () => {
    let service: ImageCompareService;
    let differenceDetector: Partial<DifferenceDetectorService>;

    beforeEach(async () => {
        differenceDetector = {
            getAllClusters: jest.fn().mockResolvedValue([{ length: 1 }]) as jest.MockedFunction<
                typeof DifferenceDetectorService.prototype.getAllClusters
            >,
            getDifficultyLevel: jest.fn().mockResolvedValue('Easy') as jest.MockedFunction<
                typeof DifferenceDetectorService.prototype.getDifficultyLevel
            >,
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ImageCompareService,
                {
                    provide: DifferenceDetectorService,
                    useValue: differenceDetector,
                },
            ],
        }).compile();

        service = module.get<ImageCompareService>(ImageCompareService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('compareImages should return expected output on success', async () => {
        const originalFile: any = {
            buffer: Buffer.from('original'),
        };

        const modifiedFile: any = {
            buffer: Buffer.from('modified'),
        };

        const expectedResult = {
            differences: 1,
            imageBase64: 'test',
            difficulty: 'Easy',
        };
        const compareImagesSpy = jest.spyOn(service, 'compareImages');
        compareImagesSpy.mockImplementation(async () => expectedResult);

        const result = await service.compareImages(originalFile, modifiedFile, '5');

        expect(result).toEqual(expectedResult);
    });

    it('compareImages should return an error message on failure', async () => {
        const originalFile: any = {
            buffer: Buffer.from('original'),
        };

        const modifiedFile: any = {
            buffer: Buffer.from('modified'),
        };

        const errorMessage = 'Error occurred';
        differenceDetector.getAllClusters = jest.fn().mockResolvedValue(new Error(errorMessage)) as jest.MockedFunction<
            typeof DifferenceDetectorService.prototype.getAllClusters
        >;

        try {
            await service.compareImages(originalFile, modifiedFile, '5');
        } catch (error) {
            expect(error).toEqual(errorMessage);
        }
    });
});
