import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { History, HistoryDocument } from '@app/model/database/history';
import { GameHistoryService } from './game-history.service';
import { HistorySheetDto } from '@app/model/dto/sheet/history-sheet.dto';

describe('GameHistoryService', () => {
  let service: GameHistoryService;
  let historyModel: Model<HistoryDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameHistoryService,
        {
          provide: getModelToken(History.name),
          useValue: {
            find: jest.fn(),
            deleteMany: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GameHistoryService>(GameHistoryService);
    historyModel = module.get<Model<HistoryDocument>>(getModelToken(History.name));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getHistory', () => {
    it('should return an array of game history records', async () => {
      const mockHistory: History[] = [
        {
          gameStart: '04/20/2023 2:22:46 PM',
          duration: '00:00',
          gameMode: 'ClassicSolo',
          player1: 'player1',
          winner1: false,
          gaveUp1: false,
          player2: 'player2',
          winner2: false,
          gaveUp2: false,
        },
        // Add more mock history records here if needed
      ];
      jest.spyOn(historyModel, 'find').mockResolvedValueOnce(mockHistory);

      const result = await service.getHistory();

      expect(result).toEqual(mockHistory);
      expect(historyModel.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteAllHistory', () => {
    it('should delete all game history records', async () => {
      const mockDeleteResult = { deletedCount: 1,  acknowledged: true };
      jest.spyOn(historyModel, 'deleteMany').mockResolvedValueOnce(mockDeleteResult);

      await expect(service.deleteAllHistory()).resolves.toBeUndefined();
      expect(historyModel.deleteMany).toHaveBeenCalledTimes(1);
    });

    it('should reject with an error message if no history records are found', async () => {
      const mockDeleteResult = { deletedCount: 0 ,  acknowledged: true };
      jest.spyOn(historyModel, 'deleteMany').mockResolvedValueOnce(mockDeleteResult);

      await expect(service.deleteAllHistory()).rejects.toEqual('Could not find games history');
      expect(historyModel.deleteMany).toHaveBeenCalledTimes(1);
    });

    it('should reject with an error message if there was an error deleting history records', async () => {
      const mockError = new Error('Database error');
      jest.spyOn(historyModel, 'deleteMany').mockRejectedValueOnce(mockError);

      await expect(service.deleteAllHistory()).rejects.toEqual(`Failed to delete games History: ${mockError}`);
      expect(historyModel.deleteMany).toHaveBeenCalledTimes(1);
    });
  });


});