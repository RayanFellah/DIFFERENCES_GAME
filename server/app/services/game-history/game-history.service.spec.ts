import { History, HistoryDocument } from '@app/model/database/history';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { GameHistoryService } from './game-history.service';

describe('GameHistoryService', () => {
    let service: GameHistoryService;
    let historyModel: Model<HistoryDocument>;

    beforeEach(async () => {
        historyModel = {
            create: jest.fn(),
            find: jest.fn(),
            deleteMany: jest.fn(),
        } as unknown as Model<HistoryDocument>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameHistoryService,
                {
                    provide: getModelToken(History.name),
                    useValue: historyModel,
                },
            ],
        }).compile();

        service = module.get<GameHistoryService>(GameHistoryService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
