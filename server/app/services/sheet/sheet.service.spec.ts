/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
import { Sheet, SheetDocument, sheetSchema } from '@app/model/database/sheet';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';

import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { SheetService } from './sheet.service';

describe('sheetService', () => {
    let service: SheetService;
    let sheetModel: Model<SheetDocument>;

    beforeEach(async () => {
        sheetModel = {
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            deleteOne: jest.fn(),
            updateOne: jest.fn(),
        } as unknown as Model<SheetDocument>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SheetService,
                Logger,
                {
                    provide: getModelToken(Sheet.name),
                    useValue: sheetModel,
                },
            ],
        }).compile();

        service = module.get<SheetService>(SheetService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

const DELAY_BEFORE_CLOSING_CONNECTION = 200;

describe('sheetServiceEndToEnd', () => {
    let service: SheetService;
    let sheetModel: Model<SheetDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();

        const module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: Sheet.name, schema: sheetSchema }]),
            ],
            providers: [SheetService, Logger],
        }).compile();

        service = module.get<SheetService>(SheetService);
        sheetModel = module.get<Model<SheetDocument>>(getModelToken(Sheet.name));
        connection = await module.get(getConnectionToken());
    });

    afterEach((done) => {
        setTimeout(async () => {
            await connection.close();
            await mongoServer.stop();
            done();
        }, DELAY_BEFORE_CLOSING_CONNECTION);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(sheetModel).toBeDefined();
    });

    it('getAllsheets() return all sheets in database', async () => {
        await sheetModel.deleteMany({});
        expect((await service.getAllSheets()).length).toEqual(0);
        const sheet = getFakesheet();
        await sheetModel.create(sheet);
        expect((await service.getAllSheets()).length).toEqual(1);
    });

    it('getSheet() return sheet with the specified _id', async () => {
        const sheet = getFakesheet();
        await sheetModel.create(sheet);
        const fetchedSheet = await service.getSheet(sheet._id);
        expect(fetchedSheet).toEqual(expect.objectContaining(sheet));
    });

    it('modifysheet() should fail if sheet does not exist', async () => {
        const sheet = getFakesheet();
        await expect(service.modifySheet(sheet)).rejects.toBeTruthy();
    });

    it('modifysheet() should fail if mongo query failed', async () => {
        jest.spyOn(sheetModel, 'updateOne').mockRejectedValue('');
        const sheet = getFakesheet();
        await expect(service.modifySheet(sheet)).rejects.toBeTruthy();
    });
    it('deletesheet() should delete the sheet', async () => {
        await sheetModel.deleteMany({});
        const sheet = getFakesheet();
        await sheetModel.create(sheet);
        await service.deleteSheet(sheet._id);
        expect(await sheetModel.countDocuments()).toEqual(0);
    });

    it('deletesheet() should fail if the sheet does not exist', async () => {
        await sheetModel.deleteMany({});
        const sheet = getFakesheet();
        await expect(service.deleteSheet(sheet._id)).rejects.toBeTruthy();
    });

    it('deletesheet() should fail if mongo query failed', async () => {
        jest.spyOn(sheetModel, 'deleteOne').mockRejectedValue('');
        const sheet = getFakesheet();
        await expect(service.deleteSheet(sheet._id)).rejects.toBeTruthy();
    });

    it('addsheet() should add the sheet to the DB', async () => {
        await sheetModel.deleteMany({});
        const sheet = getFakesheet();
        await service.addSheet(sheet);
        expect(await sheetModel.countDocuments()).toEqual(1);
    });

    it('addsheet() should fail if mongo query failed', async () => {
        jest.spyOn(sheetModel, 'create').mockImplementation(async () => Promise.reject(''));
        const sheet = getFakesheet();
        await expect(service.addSheet(sheet)).rejects.toBeTruthy();
    });
});

const getFakesheet = (): Sheet | any => ({
    _id: getRandomString(),
    difficulty: getRandomString(),
    radius: 3,
    originalImagePath: getRandomString(),
    modifiedImagePath: getRandomString(),
    topPlayer: getRandomString(),
    topScore: 0,
    differences: 5,
    isJoinable: true,
    title: getRandomString(),
    __v: 0,
});

const BASE_36 = 36;
const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);
