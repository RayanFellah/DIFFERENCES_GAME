import { Test, TestingModule } from '@nestjs/testing';
import { ImageToMatrixService } from './image-to-matrix.service';

describe('ImageToMatrixService', () => {
    let service: ImageToMatrixService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ImageToMatrixService],
        }).compile();

        service = module.get<ImageToMatrixService>(ImageToMatrixService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
