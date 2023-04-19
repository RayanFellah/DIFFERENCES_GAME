import { Coord } from '@common/coord';
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

    it('should set coords correctly', () => {
        const coords: Coord[] = [
            { posX: 1, posY: 1 },
            { posX: 2, posY: 2 },
        ];
        service.setCoord(coords);
        expect(service.coords).toEqual(coords);
    });
});
