import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { Sheet, SheetDocument } from './schemas/Sheet';
import { SheetsRepository } from './sheet.repos';

const mockSheetModel = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteMany: jest.fn(),
    create: jest.fn(),
});

describe('SheetsRepository', () => {
    let sheetsRepository: SheetsRepository;
    let sheetModel: Model<SheetDocument>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SheetsRepository, { provide: 'SheetModel', useFactory: mockSheetModel }],
        }).compile();

        sheetsRepository = module.get<SheetsRepository>(SheetsRepository);
        sheetModel = module.get<Model<SheetDocument>>('SheetModel');
    });

    describe('findOne', () => {
        it('should find and return a single sheet', async () => {
            const sheetId = 'sheet-id-123';
            const sheet = new Sheet();
            sheet.sheetId = sheetId;

            const findOneSpy = jest.spyOn(sheetModel, 'findOne').mockResolvedValue(sheet);

            const result = await sheetsRepository.findOne({ sheetId });

            expect(findOneSpy).toHaveBeenCalledWith({ sheetId });
            expect(result).toEqual(sheet);
        });
    });

    describe('findMany', () => {
        it('should find and return multiple sheets', async () => {
            const filter = { difficulty: 'easy' };
            const sheet1 = new Sheet();
            const sheet2 = new Sheet();

            const findSpy = jest.spyOn(sheetModel, 'find').mockResolvedValue([sheet1, sheet2]);

            const result = await sheetsRepository.findMany(filter);

            expect(findSpy).toHaveBeenCalledWith(filter);
            expect(result).toEqual([sheet1, sheet2]);
        });
    });

    /* describe('createOne', () => {
        it('should create a new sheet and return it', async () => {
            const sheetData = { name: 'test sheet', difficulty: 'hard' };
            const createdSheet = new Sheet();
            createdSheet.name = sheetData.name;
            createdSheet.difficulty = sheetData.difficulty;
            const result = await sheetsRepository.createOne(createdSheet);

            expect(result).toEqual(createdSheet);
        });
    });*/

    describe('findOneAndUpdate', () => {
        it('should find a single sheet and update it', async () => {
            const sheetId = 'sheet-id-123';
            const filter = { sheetId };
            const sheetData = { bestScore: '100' };
            const updatedSheet = new Sheet();
            updatedSheet.sheetId = sheetId;
            updatedSheet.bestScore = sheetData.bestScore;

            const findOneAndUpdateSpy = jest.spyOn(sheetModel, 'findOneAndUpdate').mockResolvedValue(updatedSheet);

            const result = await sheetsRepository.findOneAndUpdate(filter, sheetData);

            expect(findOneAndUpdateSpy).toHaveBeenCalledWith(filter, sheetData);
            expect(result).toEqual(updatedSheet);
        });
    });

    describe('deleteAllSheets', () => {
        it('should delete all sheets', async () => {
            const deleteManySpy = jest.spyOn(sheetModel, 'deleteMany');

            await sheetsRepository.deleteAllSheets();

            expect(deleteManySpy).toHaveBeenCalled();
        });
    });
});
