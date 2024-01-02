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

    describe('radiusEnlargement', () => {
        it('should enlarge radius by 1 when rayon is 1', () => {
            const matrix = [
                [0, 0, 0],
                [0, 1, 0],
                [0, 0, 0],
            ];
            const result = service.radiusEnlargement(matrix, 1);
            expect(result).toEqual([
                [1, 1, 1],
                [1, 1, 1],
                [1, 1, 1],
            ]);
        });

        it('should enlarge radius by 2 when rayon is 2', () => {
            const matrix = [
                [0, 0, 0],
                [0, 1, 0],
                [0, 0, 0],
            ];
            const result = service.radiusEnlargement(matrix, 2);
            expect(result).toEqual([
                [1, 1, 1],
                [1, 1, 1],
                [1, 1, 1],
            ]);
        });

        it('should not enlarge matrix when rayon is 0', () => {
            const matrix = [
                [0, 0, 0],
                [0, 1, 0],
                [0, 0, 0],
            ];
            const result = service.radiusEnlargement(matrix, 0);
            expect(result).toEqual([
                [0, 0, 0],
                [0, 1, 0],
                [0, 0, 0],
            ]);
        });

        it('should handle matrix with multiple 1s', () => {
            const matrix = [
                [1, 0, 1],
                [0, 1, 0],
                [1, 0, 1],
            ];
            const result = service.radiusEnlargement(matrix, 1);
            expect(result).toEqual([
                [1, 1, 1],
                [1, 1, 1],
                [1, 1, 1],
            ]);
        });
    });
});
