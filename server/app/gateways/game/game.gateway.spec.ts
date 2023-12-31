import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { GameLogicService } from '@app/services/game-logic/game-logic.service';
import { GatewayLogicService } from '@app/services/gateway-logic/gateway-logic.service';
import { SheetService } from '@app/services/sheet/sheet.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Subject } from 'rxjs';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Server } from 'socket.io';
import { GameGateway } from './game.gateway';

class SheetServiceMock {
    addedSheet = new Subject();
    deletedSheet = new Subject();
    async getAllSheets() {
        return Promise.resolve([]);
    }
}

describe('GameGateway', () => {
    let gateway: GameGateway;

    let gatewayService: SinonStubbedInstance<GatewayLogicService>;
    let server: SinonStubbedInstance<Server>;

    beforeEach(async () => {
        gatewayService = createStubInstance(GatewayLogicService);
        server = createStubInstance<Server>(Server);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameGateway,
                {
                    provide: SheetService,
                    useClass: SheetServiceMock,
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

        // Get an instance of GameGateway from the testing module
        gateway = module.get<GameGateway>(GameGateway);

        // Set the server property to the mocked server instance
        gateway.server = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
});
