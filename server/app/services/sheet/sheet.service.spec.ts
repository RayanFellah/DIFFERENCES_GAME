import { Sheet, SheetDocument } from '@app/model/database/sheet';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { SheetService } from './sheet.service';

describe('SheetService', () => {
    let service: SheetService;
    let sheetModel: Model<SheetDocument>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SheetService,
                {
                    provide: getModelToken(Sheet.name),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        create: jest.fn(),
                        deleteOne: jest.fn(),
                        updateOne: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<SheetService>(SheetService);
        sheetModel = module.get<Model<SheetDocument>>(getModelToken(Sheet.name));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(sheetModel).toBeDefined();
    });
});
