/* eslint-disable max-params */
import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';

@Injectable()
export class RadiusEnlargementService {
    setNeighborValues = (matrix: number[][], i: number, j: number, l: number, k: number) => {
        const rowMax = matrix.length - 1;
        const colMax = matrix[0].length - 1;

        if (j + k <= colMax) {
            matrix[i][j + k] = 1;
        }
        if (j - k >= 0) {
            matrix[i][j - k] = 1;
        }
        if (i + l <= rowMax && j + k <= colMax) {
            matrix[i + l][j + k] = 1;
        }
        if (i + l <= rowMax && j - k >= 0) {
            matrix[i + l][j - k] = 1;
        }
        if (i - l >= 0 && j + k <= colMax) {
            matrix[i - l][j + k] = 1;
        }
        if (i - l >= 0 && j - k >= 0) {
            matrix[i - l][j - k] = 1;
        }
        if (i + l <= rowMax) {
            matrix[i + l][j] = 1;
        }
        if (i - l >= 0) {
            matrix[i - l][j] = 1;
        }
    };

    radiusEnlargement = (matrix: number[][], rayon: number): number[][] => {
        const res = _.cloneDeep(matrix);
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                if (matrix[i][j] === 1) {
                    for (let k = 1; k < rayon + 1; k++) {
                        for (let l = 1; l < rayon + 1; l++) {
                            if (i + l < matrix.length && j + k < matrix[i].length) {
                                this.setNeighborValues(res, i, j, l, k);
                            }
                            if (i + l < matrix.length && j - k >= 0) {
                                this.setNeighborValues(res, i, j, l, k);
                            }
                            if (i - l >= 0 && j + k < matrix[i].length) {
                                this.setNeighborValues(res, i, j, l, k);
                            }
                            if (i - l >= 0 && j - k >= 0) {
                                this.setNeighborValues(res, i, j, l, k);
                            }
                        }
                    }
                }
            }
        }
        return res;
    };
}
