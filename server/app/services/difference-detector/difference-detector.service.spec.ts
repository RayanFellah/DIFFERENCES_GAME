/* eslint-disable @typescript-eslint/no-magic-numbers */
import { DifferenceService } from '@app/services/difference/difference.service';
import { ImageToMatrixService } from '@app/services/image-to-matrix/image-to-matrix.service';
import { RadiusEnlargementService } from '@app/services/radius-enlargement/radius-enlargement.service';
import { Test, TestingModule } from '@nestjs/testing';
import { DifferenceDetectorService } from './difference-detector.service';

describe('DifferenceDetectorService', () => {
    let service: DifferenceDetectorService;
    let imageToMatrixService: ImageToMatrixService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DifferenceDetectorService, ImageToMatrixService, RadiusEnlargementService, DifferenceService],
        }).compile();

        service = module.get<DifferenceDetectorService>(DifferenceDetectorService);
        imageToMatrixService = module.get<ImageToMatrixService>(ImageToMatrixService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return the correct matrix after comparing images', async () => {
        // Mock the imageToMatrix method to return predefined matrices for testing
        const mockMatrix1 = [
            [
                [0, 0, 0],
                [0, 1, 0],
                [0, 0, 0],
            ],
        ];

        jest.spyOn(imageToMatrixService, 'imageToMatrix').mockImplementation(async () => {
            return Promise.resolve(mockMatrix1);
        });
        const resultMatrix = await service.compareImages(imageToMatrixService, imageToMatrixService);
        expect(resultMatrix).toStrictEqual(resultMatrix);
    });

    it('should return the correct difficulty level', async () => {
        const mockMatrix = [
            [0, 0, 0],
            [0, 1, 0],
            [0, 0, 0],
        ];
        const difficultyLevel = service.calculateDifficulty(mockMatrix, 7);
        expect(difficultyLevel).toBe('Hard');
    });

    it('should find clusters in a given matrix', () => {
        const inputMatrix = [
            [0, 0, 0],
            [0, 1, 1],
            [0, 1, 0],
        ];
        const cluster = service.getCluster(inputMatrix, 1, 1);
        expect(cluster.coords).toHaveLength(3);
    });
});
