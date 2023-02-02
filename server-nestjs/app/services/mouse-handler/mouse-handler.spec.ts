import { Test, TestingModule } from '@nestjs/testing';
import { Coord } from '../Coord';
import { Difference } from '../difference/difference.service';
import { MouseHandlerService } from './mouse-handler.service';

describe('MouseHandlerService', () => {
    let service: MouseHandlerService;
    let differences: Difference[];

    beforeEach(async () => {
        differences = [
            new Difference([
                { posX: 0, posY: 0 },
                { posX: 0, posY: 1 },
            ]),
            new Difference([{ posX: 10, posY: 10 }]),
            new Difference([{ posX: 30, posY: 30 }]),
        ];
        const module: TestingModule = await Test.createTestingModule({
            providers: [MouseHandlerService],
        }).compile();
        service = module.get<MouseHandlerService>(MouseHandlerService);
    });
    describe('onMouseClick', () => {
        it('returns the difference if click is within a difference', () => {
            const click: Coord = { posX: 0, posY: 1 };
            service.differences = differences;
            const result = service.onMouseClick(click);
            expect(result).toEqual(differences[0]);
        });

        it('returns undefined if click is not within a difference', () => {
            const click: Coord = { posX: 15, posY: 15 };
            service.differences = differences;
            const result = service.onMouseClick(click);
            expect(result).toBeUndefined();
        });
    });

    describe('inDifference', () => {
        it('returns true if click is within a difference', () => {
            const click: Coord = { posX: 10, posY: 10 };
            const diff = differences[1];
            const result = service.inDifference(click, diff);
            expect(result).toBeTruthy();
        });

        it('returns false if click is not within a difference', () => {
            const click: Coord = { posX: 15, posY: 15 };
            const diff = differences[0];
            const result = service.inDifference(click, diff);
            expect(result).toBeFalsy();
        });
    });
});
