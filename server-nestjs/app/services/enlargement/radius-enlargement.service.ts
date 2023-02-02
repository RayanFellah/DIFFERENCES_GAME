import * as _ from 'lodash';

export function enlargeRadius(matrix: Array<Array<number>>, rayon: number): Array<Array<number>> {
    // let res = JSON.parse(JSON.stringify(matrix));
    let res = _.cloneDeep(matrix);

    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j] === 1) {
                for (let k = 1; k < rayon + 1; k++) {
                    for (let l = 1; l < rayon + 1; l++) {
                        if (j + k < matrix[i].length) {
                            res[i][j + k] = 1;
                        }
                        if (j - k >= 0) {
                            res[i][j - k] = 1;
                        }
                        if (i + l < matrix.length && j + k < matrix[i].length) {
                            res[i + l][j + k] = 1;
                        }
                        if (i + l < matrix.length && j - k >= 0) {
                            res[i + l][j - k] = 1;
                        }
                        if (i - l >= 0 && j + k < matrix[i].length) {
                            res[i - l][j + k] = 1;
                        }
                        if (i - l >= 0 && j - k >= 0) {
                            res[i - l][j - k] = 1;
                        }
                        if (i + l < matrix.length) {
                            res[i + l][j] = 1;
                        }
                        if (i - l >= 0) {
                            res[i - l][j] = 1;
                        }
                    }
                }
            }
        }
    }

    return res;
}
