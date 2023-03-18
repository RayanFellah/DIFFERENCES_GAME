import { Test, TestingModule } from '@nestjs/testing';
import { SheetService } from './sheet.service';
import { Sheet, SheetDocument } from '@app/model/database/sheet';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

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
    });
});