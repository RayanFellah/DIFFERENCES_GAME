import { Test, TestingModule } from '@nestjs/testing';
import { DifferenceDetectorService } from './difference-detector.service';

describe('DifferenceDetectorService', () => {
  let service: DifferenceDetectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DifferenceDetectorService],
    }).compile();

    service = module.get<DifferenceDetectorService>(DifferenceDetectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
