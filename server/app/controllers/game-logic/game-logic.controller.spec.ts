import { Sheet } from '@app/model/database/sheet';
import { DifferenceService } from '@app/services/difference/difference.service';
import { GameLogicService } from '@app/services/game-logic/game-logic.service';
import { SheetService } from '@app/services/sheet/sheet.service';
import { Coord } from '@common/coord';
import { Test, TestingModule } from '@nestjs/testing';
import { GameLogicController } from './game-logic.controller';

describe('GameLogicController', () => {
    let controller: GameLogicController;
    let gameLogicService: GameLogicService;
    let sheetService: SheetService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameLogicController],
            providers: [
                {
                    provide: GameLogicService,
                    useValue: {
                        findDifference: jest.fn(async () => Promise.resolve({ coords: [1, 2] })),
                        getAllDifferences: jest.fn(async () => Promise.resolve([{ id: 1, coords: [{ posX: 1, posY: 2 }] }])),
                    },
                },
                {
                    provide: SheetService,
                    useValue: {
                        getSheet: jest.fn(async () => Promise.resolve({ id: 1, topScore: 0 })),
                        modifySheet: jest.fn(async () => Promise.resolve()),
                    },
                },
            ],
        }).compile();

        controller = module.get<GameLogicController>(GameLogicController);
        gameLogicService = module.get<GameLogicService>(GameLogicService);
        sheetService = module.get<SheetService>(SheetService);
    });

    describe('playerClick', () => {
        it('should return difference coords', async () => {
            const sheet: Sheet = {
                title: 'game1',
                _id: '1',
                difficulty: '',
                originalImagePath: '',
                modifiedImagePath: '',
                radius: 0,
                differences: 2,
                isJoinable: true,
                top3Multi: [],
                top3Solo: [],
            };
            jest.spyOn(sheetService, 'getSheet').mockResolvedValueOnce(sheet);
            const difference = await controller.playerClick('1', '2', '1');
            expect(difference).toEqual([1, 2]);
        });

        it('should return undefined if no difference found', async () => {
            const sheet: Sheet = {
                title: 'game1',
                _id: '1',

                difficulty: '',
                originalImagePath: '',
                modifiedImagePath: '',
                radius: 0,
                differences: 2,
                isJoinable: true,
                top3Multi: [],
                top3Solo: [],
            };
            jest.spyOn(sheetService, 'getSheet').mockResolvedValueOnce(sheet);
            jest.spyOn(gameLogicService, 'findDifference').mockResolvedValueOnce(undefined);
            const difference = await controller.playerClick('1', '2', '1');
            expect(difference).toBeUndefined();
        });
    });

    describe('finishGame', () => {
        it('should not update sheet if bestScore is less than or equal to current topScore', async () => {
            const sheet: Sheet = {
                title: 'game2',
                _id: '2',
                difficulty: '',
                originalImagePath: '',
                modifiedImagePath: '',
                radius: 0,
                differences: 2,
                isJoinable: true,
                top3Multi: [],
                top3Solo: [],
            };
            jest.spyOn(sheetService, 'getSheet').mockResolvedValueOnce(sheet);
            expect(sheetService.modifySheet).not.toHaveBeenCalled();
        });
    });

    describe('getAllDifferences', () => {
        it('should return all differences coords', async () => {
            const sheet: Sheet = {
                title: 'game1',
                _id: '1',
                difficulty: '',
                originalImagePath: '',
                modifiedImagePath: '',
                radius: 0,
                differences: 2,
                isJoinable: true,
                top3Multi: [],
                top3Solo: [],
            };
            const coords1: Coord = { posX: 1, posY: 2 };
            const coords2: Coord = { posX: 3, posY: 4 };

            const difference1 = new DifferenceService();
            difference1.setCoord([coords1]);
            const difference2 = new DifferenceService();
            difference2.setCoord([coords2]);

            const differences = [difference1, difference2];

            jest.spyOn(sheetService, 'getSheet').mockResolvedValueOnce(sheet);
            jest.spyOn(gameLogicService, 'getAllDifferences').mockResolvedValueOnce(differences);

            const allDifferences = await controller.getAllDifferences('1');
            expect(allDifferences).toEqual([[coords1], [coords2]]);
        });
    });
});
