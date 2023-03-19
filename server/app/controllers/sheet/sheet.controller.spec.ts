import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { GameLogicService } from '@app/services/game-logic/game-logic.service';
import { SheetService } from '@app/services/sheet/sheet.service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SheetController } from './sheet.controller';

describe('SheetController', () => {
    let controller: SheetController;
    let service: SheetService;
    let gateway: ChatGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SheetController],
            providers: [
                {
                    provide: SheetService,
                    useValue: {},
                },
                {
                    provide: Logger,
                    useValue: {},
                },
                ChatGateway,
                GameLogicService,
            ],
        }).compile();

        controller = module.get<SheetController>(SheetController);
        service = module.get<SheetService>(SheetService);
        gateway = module.get<ChatGateway>(ChatGateway);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(gateway).toBeDefined();

        expect(controller).toBeDefined();
    });
});
