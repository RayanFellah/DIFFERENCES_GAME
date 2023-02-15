import { Sheet } from '@app/services/differences-detector/interfaces/sheet';
import { Test, TestingModule } from '@nestjs/testing';
import { SheetsRepository } from './sheet.repos';
import { SheetService } from './sheet.service';
describe('SheetService', () => {
    let sheetService: SheetService;
    let sheetsRepository: SheetsRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SheetService,
                {
                    provide: SheetsRepository,
                    useValue: {
                        findOne: jest.fn(),
                        findMany: jest.fn(),
                        createOne: jest.fn(),
                        findOneAndUpdate: jest.fn(),
                        deleteAllSheets: jest.fn(),
                    },
                },
            ],
        }).compile();

        sheetService = module.get<SheetService>(SheetService);
        sheetsRepository = module.get<SheetsRepository>(SheetsRepository);
    });

    describe('getSheetById', () => {
        it('should return the sheet with the given ID', async () => {
            const sheetId = 'abc123';
            const sheet: Sheet = {
                sheetId,
                name: 'My Sheet',
                bestScore: '10',
                topPlayer: 'Mono',
                originalImagePath: '',
                modifiedImagePath: '',
                difficulty: 'Easy',
                radius: 0,
            };
            jest.spyOn(sheetsRepository, 'findOne').mockResolvedValue(sheet);

            const result = await sheetService.getSheetById(sheetId);

            expect(result).toEqual(sheet);
            expect(sheetsRepository.findOne).toHaveBeenCalledWith({ sheetId });
        });

        it('should return undefined if no sheet is found', async () => {
            const sheetId = 'unknown';
            jest.spyOn(sheetsRepository, 'findOne').mockResolvedValue(undefined);

            const result = await sheetService.getSheetById(sheetId);

            expect(result).toBeUndefined();
            expect(sheetsRepository.findOne).toHaveBeenCalledWith({ sheetId });
        });
    });

    describe('getSheets', () => {
        it('should return all sheets', async () => {
            const sheets = [
                {
                    sheetId: '1',
                    name: 'Sheet 2',
                    bestScore: '10',
                    topPlayer: 'Mono',
                    originalImagePath: '',
                    modifiedImagePath: '',
                    difficulty: 'Easy',
                    radius: 0,
                },

                {
                    sheetId: '2',
                    name: 'Sheet 2',
                    bestScore: '10',
                    topPlayer: 'Mono',
                    originalImagePath: '',
                    modifiedImagePath: '',
                    difficulty: 'Easy',
                    radius: 0,
                },
            ];
            jest.spyOn(sheetsRepository, 'findMany').mockResolvedValue(sheets);

            const result = await sheetService.getSheets();

            expect(result).toEqual(sheets);
            expect(sheetsRepository.findMany).toHaveBeenCalledWith({});
        });
    });

    describe('createSheet', () => {
        it('should create a new sheet', async () => {
            const sheetId = 'abc123';
            const name = 'New Sheet';
            const originalImagePath = 'path/to/image.png';
            const modifiedImagePath = 'path/to/modified-image.png';
            const radius = 10;
            const difficulty = 'Easy';
            const createdSheet: Sheet = {
                sheetId,
                name,
                bestScore: '',
                difficulty: '10',
                topPlayer: '',
                originalImagePath,
                modifiedImagePath,
                radius,
            };
            jest.spyOn(sheetsRepository, 'createOne').mockResolvedValue(createdSheet);

            const result = await sheetService.createSheet(name, sheetId, originalImagePath, modifiedImagePath, radius, difficulty);

            expect(result).toEqual(createdSheet);
            expect(sheetsRepository.createOne).toHaveBeenCalledWith(createdSheet);
        });
    });
    describe('updateSheet', () => {
        it('should update a sheet by ID', async () => {
            const sheetId = 'abc123';
            const sheetUpdates = { bestScore: '200', topPlayer: 'Jane Doe' };
            const updatedSheet: Sheet = {
                sheetId,
                name: 'Test Sheet',
                bestScore: '200',
                difficulty: 'easy',
                topPlayer: 'Jane Doe',
                originalImagePath: '/path/to/original.png',
                modifiedImagePath: '/path/to/modified.png',
                radius: 5,
            };

            jest.spyOn(sheetsRepository, 'findOneAndUpdate').mockResolvedValue(updatedSheet);

            const result = await sheetService.updateSheet(sheetId, sheetUpdates);

            expect(result).toEqual(updatedSheet);
            expect(sheetsRepository.findOneAndUpdate).toHaveBeenCalledWith({ sheetId }, sheetUpdates);
        });
    });

    describe('deleteAllSheets', () => {
        it('should delete all sheets', async () => {
            jest.spyOn(sheetsRepository, 'deleteAllSheets').mockResolvedValue(undefined);

            const result = await sheetService.deleteAllSheets();

            expect(result).toBeUndefined();
            expect(sheetsRepository.deleteAllSheets).toHaveBeenCalled();
        });
    });
});
