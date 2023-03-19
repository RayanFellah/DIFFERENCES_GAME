import { DifferenceService } from '@app/services/difference/difference.service';
import { ImageToMatrixService } from '@app/services/image-to-matrix/image-to-matrix.service';
import { RadiusEnlargementService } from '@app/services/radius-enlargement/radius-enlargement.service';
import { Test, TestingModule } from '@nestjs/testing';
import { DifferenceDetectorService } from './difference-detector.service';
describe('DifferenceDetectorService', () => {
    let service: DifferenceDetectorService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DifferenceDetectorService, RadiusEnlargementService, DifferenceService, ImageToMatrixService],
        }).compile();

        service = module.get<DifferenceDetectorService>(DifferenceDetectorService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
