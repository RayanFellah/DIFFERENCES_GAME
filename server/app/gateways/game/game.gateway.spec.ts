import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { GameLogicService } from '@app/services/game-logic/game-logic.service';
import { GatewayLogicService } from '@app/services/gateway-logic/gateway-logic.service';
import { SheetService } from '@app/services/sheet/sheet.service';
import { Sheet } from '@common/sheet';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Server } from 'socket.io';
import { GameGateway } from './game.gateway';

describe('GameGateway', () => {
    let gateway: GameGateway;
    let sheetService: SinonStubbedInstance<SheetService>;
    let gatewayService: SinonStubbedInstance<GatewayLogicService>;
    let server: SinonStubbedInstance<Server>;
    const sheetMocks: Sheet[] = [];

    beforeEach(async () => {
        sheetService = createStubInstance(SheetService);
        gatewayService = createStubInstance(GatewayLogicService);
        server = createStubInstance<Server>(Server);

        jest.spyOn(sheetService, 'getAllSheets').mockImplementation(async () => {
            return new Promise<Sheet[]>((resolve) => {
                resolve(sheetMocks);
            });
        });
        jest.spyOn(gatewayService, 'getAllSheets').mockImplementation(async () => {
            return new Promise<Sheet[]>((resolve) => {
                resolve(sheetMocks);
            });
        });
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameGateway,

                {
                    provide: SheetService,
                    useValue: {},
                },
                {
                    provide: GameLogicService,
                    useValue: {},
                },
                {
                    provide: GameHistoryService,
                    useValue: {},
                },
                {
                    provide: GatewayLogicService,
                    useValue: gatewayService,
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
