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

    describe('findEdges', () => {
        it('should return empty array when no coords provided', () => {
            service.setCoord([]);
            const edges = service.findEdges();
            expect(edges).toEqual([]);
        });

        it('should return edges correctly', () => {
            const coords: Coord[] = [
                { posX: 0, posY: 0 },
                { posX: 0, posY: 1 },
                { posX: 1, posY: 1 },
                { posX: 1, posY: 0 },
                { posX: 2, posY: 0 },
            ];
            service.setCoord(coords);
            const edges = service.findEdges();
            expect(edges).toEqual(
                expect.arrayContaining([
                    { posX: 0, posY: 0 },
                    { posX: 0, posY: 1 },
                    { posX: 1, posY: 0 },
                    { posX: 2, posY: 0 },
                ]),
            );
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            expect(edges.length).toBe(5);
        });

        it('should not include surrounded coordinate in edges', () => {
            const coords: Coord[] = [
                { posX: 0, posY: 0 },
                { posX: 0, posY: 1 },
                { posX: 1, posY: 1 },
                { posX: 1, posY: 0 },
                { posX: 2, posY: 0 },
                { posX: 1, posY: 2 },
                { posX: 0, posY: 2 },
                { posX: 2, posY: 1 },
                { posX: 2, posY: 2 },
            ];
            service.setCoord(coords);
            const edges = service.findEdges();
            expect(edges).not.toContainEqual({ posX: 1, posY: 1 });
        });
    });
});
