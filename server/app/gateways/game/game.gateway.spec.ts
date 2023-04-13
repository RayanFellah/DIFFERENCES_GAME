import { GameLogicService } from '@app/services/game-logic/game-logic.service';
import { SheetService } from '@app/services/sheet/sheet.service';
import { Sheet } from '@common/sheet';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Server } from 'socket.io';
import { GameGateway } from './game.gateway';

describe('GameGateway', () => {
    let gateway: GameGateway;
    let logger: SinonStubbedInstance<Logger>;
    let sheetService: SinonStubbedInstance<SheetService>;
    let gameService: SinonStubbedInstance<GameLogicService>;
    let server: SinonStubbedInstance<Server>;
    const sheetMocks: Sheet[] = [];
    // let socket: SinonStubbedInstance<Socket>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        sheetService = createStubInstance(SheetService);
        gameService = createStubInstance(GameLogicService);
        server = createStubInstance<Server>(Server);
        jest.spyOn(sheetService, 'getAllSheets').mockImplementation(async () => {
            return new Promise<Sheet[]>((resolve) => {
                resolve(sheetMocks);
            });
        });
        // socket = createStubInstance<Socket>(Socket);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameGateway,
                {
                    provide: Logger,
                    useValue: logger,
                },
                {
                    provide: SheetService,
                    useValue: sheetService,
                },
                {
                    provide: GameLogicService,
                    useValue: gameService,
                },
            ],
        }).compile();

        gateway = module.get<GameGateway>(GameGateway);
        gateway.server = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
});
