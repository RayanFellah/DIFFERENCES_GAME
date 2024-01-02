import { Test, TestingModule } from '@nestjs/testing';
import { GameConstantsService } from './game-constants.service';

describe('GameConstantsService', () => {
    let service: GameConstantsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameConstantsService],
        }).compile();

        service = module.get<GameConstantsService>(GameConstantsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
