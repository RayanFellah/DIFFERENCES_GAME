import { Test, TestingModule } from '@nestjs/testing';
import { RadiusEnlargementService } from './radius-enlargement.service';

describe('RadiusEnlargementService', () => {
  let service: RadiusEnlargementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RadiusEnlargementService],
    }).compile();

    service = module.get<RadiusEnlargementService>(RadiusEnlargementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
