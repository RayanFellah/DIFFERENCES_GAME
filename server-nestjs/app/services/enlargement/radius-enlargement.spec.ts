import { Test, TestingModule } from '@nestjs/testing';
import * as _ from 'lodash';
import { enlargeRadius } from './radius-enlargement.service';

describe('testing the radius enlargement service', () => {
    let matrixStub = [
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 1, 0, 0],
    ];

    let coordStub = { i: 0, j: 2 };
    let radiusStub: number;

    const count = (matrix: number[][]) => {
        let ctr = 0;
        for (let arr of matrix) {
            for (let point of arr) {
                if (point === 1) {
                    ctr++;
                }
            }
        }
        return ctr;
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [],
        }).compile();
    });

    it('Testing if the radius enlargement function returns more 1s on the binary matrix', () => {
        radiusStub = 1;
        const test = enlargeRadius(matrixStub, radiusStub);
        expect(count(matrixStub)).toBeLessThan(count(test));
    });

    it('Testing the case when the enlargement radius is 0', () => {
        radiusStub = 0;
        expect(count(matrixStub)).toBe(count(enlargeRadius(matrixStub, radiusStub)));
    });

    it('Testing if for a certain point, all its neighbors are 1s after enlargement', () => {
        radiusStub = 1;
        const test = enlargeRadius(matrixStub, radiusStub);
        expect(test[coordStub.i][coordStub.j + 1]).toBe(1);
        expect(test[coordStub.i][coordStub.j - 1]).toBe(1);
    });

    it('enlargeRadius should call the cloneDeep method of _ module', () => {
        const spy = jest.spyOn(_, 'cloneDeep').mockImplementationOnce(() => {});
        enlargeRadius(matrixStub, null);
        expect(spy).toHaveBeenCalledWith(matrixStub);
    });

    it('Testing if the function returns a DeepCopy of the matrix', () => {
        radiusStub = 0;
        const test = enlargeRadius(matrixStub, radiusStub);
        expect(matrixStub).not.toBe(test);
    });
});
