/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable import/namespace */
import { DifferenceDetectorService } from '@app/services/difference-detector/difference-detector.service';
import { DifferenceService } from '@app/services/difference/difference.service';
import { ImageToMatrixService } from '@app/services/image-to-matrix/image-to-matrix.service';
import { RadiusEnlargementService } from '@app/services/radius-enlargement/radius-enlargement.service';
import { Coord } from '@common/coord';
import { Sheet } from '@common/sheet';
import { Test, TestingModule } from '@nestjs/testing';
import * as Jimp from 'jimp';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { GameLogicService } from './game-logic.service';

jest.mock('jimp', () => ({
    read: jest.fn().mockImplementation(() => ({
        getBufferAsync: jest.fn().mockResolvedValue(Buffer.alloc(0)),
    })),
}));

describe('GameLogicService', () => {
    let service: GameLogicService;
    let diffDetectorService: SinonStubbedInstance<DifferenceDetectorService>;
    let imageToMatrixService: SinonStubbedInstance<ImageToMatrixService>;
    beforeEach(async () => {
        imageToMatrixService = createStubInstance(ImageToMatrixService);
        diffDetectorService = createStubInstance(DifferenceDetectorService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameLogicService,
                {
                    provide: ImageToMatrixService,
                    useValue: imageToMatrixService,
                },
                {
                    provide: DifferenceDetectorService,
                    useValue: diffDetectorService,
                },
            ],
        }).compile();

        service = module.get<GameLogicService>(GameLogicService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getDifferenceDetector', () => {
        it('should return a difference detector', async () => {
            const readSpy = jest.spyOn(Jimp, 'read');
            const getBufferAsyncSpy = jest.spyOn(await Jimp.read(''), 'getBufferAsync');

            const gameSheet = getFakeSheet();
            await service.getDifferenceDetector(gameSheet);

            expect(service.getDifferenceDetector).toBeDefined();
            expect(readSpy).toHaveBeenCalledTimes(3);
            expect(getBufferAsyncSpy).not.toHaveBeenCalled();
        });
    });
    describe('getAllDifferences', () => {
        it('should call getDifferenceDetector and DifferenceDetectorService.getAllClusters with correct argument', async () => {
            const spyGetDifferenceDetector = jest
                .spyOn(service, 'getDifferenceDetector')
                .mockResolvedValue(
                    new DifferenceDetectorService(
                        new RadiusEnlargementService(),
                        new DifferenceService(),
                        new ImageToMatrixService(),
                        new ImageToMatrixService(),
                    ),
                );
            const spyGetAllClusters = jest.spyOn(DifferenceDetectorService.prototype, 'getAllClusters').mockResolvedValue([]);

            const sheet: Partial<Sheet> = { radius: 7 };
            await service.getAllDifferences(sheet);

            expect(spyGetDifferenceDetector).toHaveBeenCalled();
            expect(spyGetAllClusters).toHaveBeenCalledWith(sheet.radius);
        });
    });
    describe('getDifficulty', () => {
        it('should call getDifferenceDetector and DifferenceDetectorService.getDifficultyLevel with correct argument', async () => {
            const spyGetDifferenceDetector = jest
                .spyOn(service, 'getDifferenceDetector')
                .mockResolvedValue(
                    new DifferenceDetectorService(
                        new RadiusEnlargementService(),
                        new DifferenceService(),
                        new ImageToMatrixService(),
                        new ImageToMatrixService(),
                    ),
                );
            const spyGetDifficultyLevel = jest.spyOn(DifferenceDetectorService.prototype, 'getDifficultyLevel').mockResolvedValueOnce('Hard');

            const sheet: Sheet = {} as Sheet;
            await service.getDifficulty(sheet);

            expect(spyGetDifferenceDetector).toHaveBeenCalled();
            expect(spyGetDifficultyLevel).toHaveBeenCalledWith(7);
        });
    });
    describe('findDifference', () => {
        it('should return a difference if found', async () => {
            const gameSheet = getFakeSheet();

            const differenceServices = [getMockDifferenceService()];
            service.getAllDifferences = jest.fn().mockResolvedValue(differenceServices);

            const foundDifference = await service.findDifference(gameSheet, 1, 1);

            expect(foundDifference).toBeDefined();
            expect(foundDifference).toBe(differenceServices[0]);
        });

        it('should return undefined if no difference is found', async () => {
            const gameSheet = getFakeSheet();

            const differenceServices = [getMockDifferenceService()];
            service.getAllDifferences = jest.fn().mockResolvedValue(differenceServices);

            const notFoundDifference = await service.findDifference(gameSheet, 3, 3);

            expect(notFoundDifference).toBeUndefined();
        });
    });
});
const getFakeSheet = (): Sheet => ({
    _id: 'sheetId123',
    difficulty: getRandomString(),
    radius: 3,
    originalImagePath: getRandomString(),
    modifiedImagePath: getRandomString(),
    topPlayer: getRandomString(),
    topScore: 0,
    differences: 5,
    isJoinable: true,
    title: getRandomString(),
});

const BASE_36 = 36;
const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);
const getMockDifferenceService = (): DifferenceService => {
    const mockDifferenceService: DifferenceService = {
        listEdges: [],
        coords: [
            { posX: 1, posY: 1 },
            { posX: 2, posY: 2 },
        ],
        found: false,
        setCoord(coords: Coord[]) {
            this.coords = coords;
        },
        findEdges() {
            for (const coord of this.coords) {
                if (
                    this.coords.find((res: Coord) => res.posX === coord.posX + 1 && res.posY === coord.posY) &&
                    this.coords.find((res: Coord) => res.posX === coord.posX && res.posY === coord.posY + 1) &&
                    this.coords.find((res: Coord) => res.posX === coord.posX - 1 && res.posY === coord.posY) &&
                    this.coords.find((res: Coord) => res.posX === coord.posX && res.posY === coord.posY - 1)
                ) {
                    continue;
                } else {
                    this.listEdges.push(coord);
                }
            }
            return this.listEdges;
        },
    };
    return mockDifferenceService;
};
