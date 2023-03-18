import { Test, TestingModule } from '@nestjs/testing';
import { GameLogicController } from './game-logic.controller';
import { GameLogicService } from '@app/services/game-logic/game-logic.service';
import { SheetService } from '@app/services/sheet/sheet.service';
import { Sheet } from '@app/model/database/sheet';

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
                topScore: 0,
                difficulty: '',
                originalImagePath: '',
                modifiedImagePath: '',
                radius: 0,
                differences: 2,
                isJoinable: true,
                topPlayer: 'zied',
            };
            jest.spyOn(sheetService, 'getSheet').mockResolvedValueOnce(sheet);
            const difference = await controller.playerClick('1', '2', '1');
            expect(difference).toEqual([1, 2]);
        });

        it('should return undefined if no difference found', async () => {
            const sheet: Sheet = {
                title: 'game1',
                _id: '1',
                topScore: 0,
                difficulty: '',
                originalImagePath: '',
                modifiedImagePath: '',
                radius: 0,
                differences: 2,
                isJoinable: true,
                topPlayer: 'zied',
            };
            jest.spyOn(sheetService, 'getSheet').mockResolvedValueOnce(sheet);
            jest.spyOn(gameLogicService, 'findDifference').mockResolvedValueOnce(undefined);
            const difference = await controller.playerClick('1', '2', '1');
            expect(difference).toBeUndefined();
        });
    });

    describe('finishGame', () => {
        it('should update sheet if bestScore is greater than current topScore', async () => {
            const sheet: Sheet = {
                title: 'game1',
                _id: '1',
                topScore: 0,
                difficulty: '',
                originalImagePath: '',
                modifiedImagePath: '',
                radius: 0,
                differences: 2,
                isJoinable: true,
                topPlayer: 'zied',
            };
            const updates = { playerName: 'test', bestScore: 2 };
            jest.spyOn(sheetService, 'getSheet').mockResolvedValueOnce(sheet);
            await controller.finishGame('1', updates);
            expect(sheetService.modifySheet).toHaveBeenCalledWith({
                topPlayer: updates.playerName,
                topScore: updates.bestScore,
            });
        });

        it('should not update sheet if bestScore is less than or equal to current topScore', async () => {
            const sheet: Sheet = {
                title: 'game2',
                _id: '2',
                topScore: 5,
                difficulty: '',
                originalImagePath: '',
                modifiedImagePath: '',
                radius: 0,
                differences: 2,
                isJoinable: true,
                topPlayer: 'skander',
            };
            const updates = { playerName: 'test', bestScore: 5 };
            jest.spyOn(sheetService, 'getSheet').mockResolvedValueOnce(sheet);
            await controller.finishGame('1', updates);
            expect(sheetService.modifySheet).not.toHaveBeenCalled();
        });
    });
});
