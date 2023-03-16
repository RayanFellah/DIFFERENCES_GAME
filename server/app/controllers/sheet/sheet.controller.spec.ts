import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { Sheet } from '@app/model/database/sheet';
import { SheetService } from '@app/services/sheet/sheet.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SheetController } from './sheet.controller';

describe('SheetController', () => {
    let controller: SheetController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SheetController],
            providers: [Sheet, SheetService, ChatGateway],
        }).compile();

        controller = module.get<SheetController>(SheetController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
