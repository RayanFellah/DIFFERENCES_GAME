import { Test, TestingModule } from '@nestjs/testing';
import { Coord } from '../Coord';
import { Difference } from './difference.service';

describe('testing the Difference component', () => {
    let service: Difference;
    let clusterStub: Array<Coord>;

    clusterStub = [
        { posX: 0, posY: 0 },
        { posX: 0, posY: 1 },
        { posX: 0, posY: 2 },
        { posX: 1, posY: 0 },
        { posX: 1, posY: 1 },
        { posX: 1, posY: 2 },
        { posX: 2, posY: 0 },
        { posX: 2, posY: 1 },
        { posX: 2, posY: 2 },
    ];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [Difference, { provide: Array<Coord>, useValue: clusterStub }],
        }).compile();

        service = module.get<Difference>(Difference);
        // a verifier
    });

    it('testing if findEdges returns the edge points of the cluster', () => {
        service.findEdges();
        expect(service.listEdges.find((res) => res.posX == 1 && res.posY == 1)).toBeFalsy();
        expect(service.listEdges.find((res) => res.posX == 0 && res.posX == 0)).toBeTruthy();
        expect(service.listEdges.length).toBeLessThanOrEqual(clusterStub.length);
    });
});
