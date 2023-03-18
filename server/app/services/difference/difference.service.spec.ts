import { Test, TestingModule } from '@nestjs/testing';
import { DifferenceService } from './difference.service';

describe('DifferenceService', () => {
    let service: DifferenceService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DifferenceService],
        }).compile();

        service = module.get<DifferenceService>(DifferenceService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
