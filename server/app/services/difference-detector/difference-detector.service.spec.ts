import { Test, TestingModule } from '@nestjs/testing';
import { DifferenceDetectorService } from './difference-detector.service';
import { RadiusEnlargementService } from '../radius-enlargement/radius-enlargement.service';
import { DifferenceService } from '../difference/difference.service';
import { ImageToMatrixService } from '../image-to-matrix/image-to-matrix.service';
describe('DifferenceDetectorService', () => {
  let service: DifferenceDetectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DifferenceDetectorService,RadiusEnlargementService,DifferenceService,ImageToMatrixService],
    }).compile();

    service = module.get<DifferenceDetectorService>(DifferenceDetectorService);
  });

  it('should be defined', () => {

    expect(service).toBeDefined();
  });
});
