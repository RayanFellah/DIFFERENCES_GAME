import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { GameLogicService } from '@app/services/game-logic/game-logic.service';
import { SheetService } from '@app/services/sheet/sheet.service';
import { Test, TestingModule } from '@nestjs/testing';
import { GatewayLogicService } from './gateway-logic.service';


describe('GatewayLogicService', () => {
    let service: GatewayLogicService;



    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GatewayLogicService,
                {
                    provide: GameHistoryService,
                    useValue: {},
                },
                {
                    provide: GameLogicService,
                    useValue: {},
                },
                {
                    provide: SheetService,
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<GatewayLogicService>(GatewayLogicService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

});

