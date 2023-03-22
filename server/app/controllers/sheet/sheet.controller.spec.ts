import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { Sheet } from '@app/model/database/sheet';
import { UpdateSheetDto } from '@app/model/dto/sheet/update-sheet.dto';
import { GameLogicService } from '@app/services/game-logic/game-logic.service';
import { SheetService } from '@app/services/sheet/sheet.service';
import { HttpStatus, Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { SheetController } from './sheet.controller';

describe('SheetController', () => {
    let controller: SheetController;
    let service: SheetService;
    let gateway: ChatGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SheetController],
            providers: [
                {
                    provide: SheetService,
                    useValue: {
                        getAllSheets: jest.fn(),
                        getSheet: jest.fn(),
                        addSheet: jest.fn(),
                        modifySheet: jest.fn(),
                        deleteSheet: jest.fn(),
                    },
                },
                {
                    provide: Logger,
                    useValue: {},
                },
                ChatGateway,
                GameLogicService,
            ],
        }).compile();

        controller = module.get<SheetController>(SheetController);
        service = module.get<SheetService>(SheetService);
        gateway = module.get<ChatGateway>(ChatGateway);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(gateway).toBeDefined();

        expect(controller).toBeDefined();
    });

    describe('allSheets', () => {
        it('should return all sheets', async () => {
            const mockSheets: Sheet[] = [
                {
                    _id: '1',
                    title: 'Test Sheet 1',
                    difficulty: 'easy',
                    radius: 10,
                    originalImagePath: 'path1',
                    modifiedImagePath: 'path2',
                    topPlayer: 'player1',
                    topScore: 100,
                    differences: 3,
                    isJoinable: false,
                },
                {
                    _id: '2',
                    title: 'Test Sheet 2',
                    difficulty: 'medium',
                    radius: 15,
                    originalImagePath: 'path3',
                    modifiedImagePath: 'path4',
                    topPlayer: 'player2',
                    topScore: 200,
                    differences: 5,
                    isJoinable: false,
                },
            ];

            service.getAllSheets = jest.fn().mockResolvedValue(mockSheets);
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            await controller.allSheets(res);

            expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(res.json).toHaveBeenCalledWith(mockSheets);
        });

        it('should return NOT_FOUND when service throws an error', async () => {
            service.getAllSheets = jest.fn().mockRejectedValue(new Error('Example not found'));
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;

            await controller.allSheets(res);

            expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
            expect(res.send).toHaveBeenCalledWith('Example not found');
        });
    });

    describe('id', () => {
        it('should return a sheet by id', async () => {
            const mockSheet: Sheet = {
                _id: '1',
                title: 'Test Sheet 1',
                difficulty: 'easy',
                radius: 10,
                originalImagePath: 'path1',
                modifiedImagePath: 'path2',
                topPlayer: 'player1',
                topScore: 100,
                differences: 3,
                isJoinable: false,
            };

            service.getSheet = jest.fn().mockResolvedValue(mockSheet);
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            await controller.id('1', res);

            expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(res.json).toHaveBeenCalledWith(mockSheet);
        });
        it('should return NOT_FOUND when service throws an error', async () => {
            service.getSheet = jest.fn().mockRejectedValue(new Error('Sheet not found'));
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;

            await controller.id('1', res);

            expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
            expect(res.send).toHaveBeenCalledWith('Sheet not found');
        });
    });

    describe('modifySheet', () => {
        it('should modify a sheet', async () => {
            const mockUpdateSheetDto: UpdateSheetDto = {
                _id: '1',
                topPlayer: 'player1',
                topScore: 200,
            };

            service.modifySheet = jest.fn().mockResolvedValue(null);
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;

            await controller.modifySheet(mockUpdateSheetDto, res);

            expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(res.send).toHaveBeenCalled();
        });

        it('should return NOT_FOUND when service throws an error', async () => {
            const mockUpdateSheetDto: UpdateSheetDto = {
                _id: '1',
                topPlayer: 'player1',
                topScore: 200,
            };

            service.modifySheet = jest.fn().mockRejectedValue(new Error('Sheet not found'));
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;

            await controller.modifySheet(mockUpdateSheetDto, res);

            expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
            expect(res.send).toHaveBeenCalledWith('Sheet not found');
        });
    });

    describe('deleteSheet', () => {
        it('should delete a sheet', async () => {
            service.deleteSheet = jest.fn().mockResolvedValue(null);
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;

            await controller.deleteSheet('1', res);

            expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(res.send).toHaveBeenCalled();
        });
    });
});
