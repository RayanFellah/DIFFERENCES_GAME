import { Coord } from '@app/interfaces/Coord';
import { Test, TestingModule } from '@nestjs/testing';
import * as EnlargeRadiusModule from '../enlargement/radius-enlargement.service';
import { ImageService } from '../Image-service/image.service';
import { DifferenceDetector } from './differences-detector.service';
const Jimp = require('jimp');

describe('Differnces-detector tests', () => {
    let service: DifferenceDetector;
    let path1: string = 'app/services/Image-service/imageStubs/img2.png';
    let path2: string = 'app/services/Image-service/imageStubs/img1.png';

    let image1: ImageService = new ImageService(path1);
    let image2: ImageService = new ImageService(path2);

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DifferenceDetector,
                {
                    provide: ImageService,
                    useValue: image1,
                },
                {
                    provide: ImageService,
                    useValue: image2,
                },
            ],
        }).compile();
        service = module.get<DifferenceDetector>(DifferenceDetector);
    });

    it('CompareImages should call Image.imageToMatrix twice', async () => {
        const matrix1 = [
            [
                [0, 1, 0],
                [1, 0, 0],
                [0, 0, 1],
            ],
            [
                [1, 1, 1],
                [1, 0, 0],
                [0, 0, 0],
            ],
            [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 1],
            ],
        ];
        const matrix2 = [
            [
                [0, 1, 1],
                [1, 1, 1],
                [0, 0, 1],
            ],
            [
                [1, 0, 1],
                [1, 1, 1],
                [1, 0, 0],
            ],
            [
                [0, 1, 0],
                [1, 1, 1],
                [1, 0, 1],
            ],
        ];
        const expectedMatrix = [
            [1, 1, 0],
            [1, 1, 1],
            [0, 0, 1],
        ];
        const spyImage1 = jest.spyOn(image1, 'imageToMatrix').mockResolvedValue(matrix1);
        const spyImage2 = jest.spyOn(image2, 'imageToMatrix').mockResolvedValue(matrix2);

        let result = await service['compareImages'](image1, image2);

        expect(spyImage1).toHaveBeenCalled();
        expect(spyImage2).toHaveBeenCalled();
        expect(result).toEqual(expectedMatrix);
    });

    it('getCluster should catch all the corrdinates of a cluster in a matrix', async () => {
        const matrixStub = [
            [1, 1, 0],
            [1, 1, 0],
            [0, 0, 0],
        ];
        const clusterPositions: Array<Coord> = [
            { posX: 0, posY: 0 },
            { posX: 0, posY: 1 },
            { posX: 1, posY: 0 },
            { posX: 1, posY: 1 },
        ];
        const difference = await service['getCluster'](matrixStub, 0, 0);
        expect(difference.coords.length).toEqual(clusterPositions.length);
        for (let i = 0; i < clusterPositions.length; i++) {
            expect(difference.coords[i].posX).toEqual(clusterPositions[i].posX);
            expect(difference.coords[i].posY).toEqual(clusterPositions[i].posY);
        }
    });
    it('calculateDifficulty should return Hard when ratio is greater than 0.15', async () => {
        const matrixStub = [
            [1, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ];
        const difficulty = await service['calculateDifficulty'](matrixStub, 10);
        expect(difficulty).toEqual('Hard');
    });
    it('calculateDifficulty should return Easy when ratio is lesser or equal than 0.15', async () => {
        const matrixStub = [
            [1, 1, 1],
            [0, 1, 1],
            [0, 1, 0],
        ];
        const difficulty = await service['calculateDifficulty'](matrixStub, 3);
        expect(difficulty).toEqual('Easy');
    });

    it('getAllClusters should return an array of Differences and call enlargeRadius', async () => {
        const spy = jest.spyOn(EnlargeRadiusModule, 'enlargeRadius');
        const mockData: number[][] = [
            [1, 0, 0, 1],
            [0, 1, 0, 0],
            [1, 0, 0, 1],
        ];
        spy.mockImplementation(() => mockData);
        expect(await service.getAllClusters(0)).toHaveLength(3);
        expect(spy).toHaveBeenCalled();
    });

    it('CompareImages should throw an error if images fail to load', async () => {
        // Mock imageToMatrix to return undefined
        jest.spyOn(image1, 'imageToMatrix').mockImplementation(() => undefined);
        jest.spyOn(image2, 'imageToMatrix').mockImplementation(() => undefined);

        let result = await service['compareImages'](image1, image2);
        // Expect the function to throw an error
        expect(result).toEqual(new Error('Images failed to load'));
    });

    it(' CompareImages should throw an error if images have different sizes', async () => {
        // Mock imageToMatrix to return matrices with different sizes
        jest.spyOn(image1, 'imageToMatrix').mockResolvedValue([[[0, 1, 0]], [[1, 0]]]);
        jest.spyOn(image2, 'imageToMatrix').mockResolvedValue([[[0, 1]], [[1, 0]], [[1, 1]]]);

        let result = await service['compareImages'](image1, image2);
        // Expect the function to throw an error
        expect(result).toEqual(new Error("Images don't have the same size"));
    });
    it(' getDifficulty Level should return Easy or Hard', async () => {
        let result = await service.getDifficultyLevel(10);
        expect(result).toEqual('Hard');
    });
});
