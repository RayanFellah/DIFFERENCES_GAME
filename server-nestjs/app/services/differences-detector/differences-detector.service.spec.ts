import { Test, TestingModule } from '@nestjs/testing';
import cluster from 'cluster';
import { Coord } from '../Coord';
import { ImageService } from '../Image-service/Image.service';
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

    it('CompareImages should call Image.imagetoMatrix twice', async () => {
        const spyImage1 = jest.spyOn(image1, 'imageToMatrix').mockImplementationOnce(async () => {
            return Promise.resolve([[[]]]);
        });
        const spyImage2 = jest.spyOn(image2, 'imageToMatrix').mockImplementationOnce(async () => {
            return Promise.resolve([[[]]]);
        });

        service['compareImages'](image1, image2);

        expect(spyImage1).toHaveBeenCalled();
        expect(spyImage2).toHaveBeenCalled();
    });

    it('getCluster should catch all the corrdinates of a cluster in a matrix', () => {
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
        const difference = service['getCluster'](matrixStub, 0, 0);
        expect(difference.coords.length).toEqual(clusterPositions.length);
        for (let i = 0; i < clusterPositions.length; i++) {
            expect(difference.coords[i].posX).toEqual(cluster[i].posX);
            expect(difference.coords[i].posY).toEqual(cluster[i].posY);
        }
    });
    it('calculateDifficulty should return Easy when ratio is greater than 0.15', async () => {
        const matrixStub = [
            [1, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ];
        const difficulty = service['calculateDifficulty'](matrixStub);
        expect(difficulty).toEqual('Easy');
    });
    it('calculateDifficulty should return Hard when ratio is lesser or equal than 0.15', async () => {
        const matrixStub = [
            [1, 1, 1],
            [0, 1, 1],
            [0, 1, 0],
        ];
        const difficulty = service['calculateDifficulty'](matrixStub);
        expect(difficulty).toEqual('Hard');
    });
});
