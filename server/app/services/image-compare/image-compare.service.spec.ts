import { Test, TestingModule } from '@nestjs/testing';
import { ImageCompareService } from './image-compare.service';

describe('ImageCompareService', () => {
  let service: ImageCompareService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageCompareService],
    }).compile();

    service = module.get<ImageCompareService>(ImageCompareService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
