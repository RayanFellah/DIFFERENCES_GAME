import { Test, TestingModule } from '@nestjs/testing';
import { ImageuploadService } from './image-storage.service';

describe('ImageuploadService', () => {
  let service: ImageuploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageuploadService],
    }).compile();

    service = module.get<ImageuploadService>(ImageuploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
