const Jimp = require('jimp');
import { Coord } from '@app/interfaces/Coord';
import { Injectable } from '@nestjs/common';
import { Difference } from '../difference/difference.service';
import { enlargeRadius } from '../enlargement/radius-enlargement.service';
import { ImageService } from '../Image-service/Image.service';

@Injectable()
export class DifferenceDetector {
    public image1: ImageService;
    public image2: ImageService;
    public differences: Array<Difference> = [];

    /** L'objet DifferenceDetector prend deux Images en parametre
     *
     * @param img1
     * @param img2
     */

    constructor(img1: ImageService, img2: ImageService) {
        this.image1 = img1;
        this.image2 = img2;
    }
    /**
     * Cette fonction sert a chercher tous les packets de coordonnees associes a une difference
     * entre deux images et le mettre dans la liste des differences
     * @param rayon : rayon d'elargissement pris en compte
     */

    async getAllClusters(rayon: number): Promise<Difference[]> {
        const matrix = enlargeRadius(await this.compareImages(this.image1, this.image2), rayon);
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                if (matrix[i][j] == 1) {
                    this.differences.push(this.getCluster(matrix, i, j));
                }
            }
        }
        return this.differences;
    }

    /**
     *
     * @param matrix une matrice binaire qui represente un pixel different par un 1et un pixel pareil par
     * un 0
     * @param i position en x du pixel different
     * @param j position en y du pixel different
     * @returns une Difference, qui est un amas de pixels differents representes par un 1 dans la matrice
     * montrant les pixels differents
     */

    private getCluster(matrix: Array<Array<number>>, i: number, j: number): Difference {
        let queue = [[i, j]];
        const coordList: Array<Coord> = [];

        while (queue.length) {
            let [x, y] = queue.shift();
            if (x < 0 || x >= matrix.length || y < 0 || y >= matrix[x].length || matrix[x][y] != 1) continue;
            coordList.push({ posX: x, posY: y });
            matrix[x][y] = -1;
            queue.push([x + 1, y]);
            queue.push([x - 1, y]);
            queue.push([x, y + 1]);
            queue.push([x, y - 1]);
            queue.push([x + 1, y + 1]);
            queue.push([x - 1, y - 1]);
            queue.push([x - 1, y + 1]);
            queue.push([x + 1, y - 1]);
        }
        return new Difference(coordList);
    }

    /**
     * Cette fonction prend deux images et retourne un matrice nous donnant les pixels differents
     * entres celles-ci
     * @param img1 objet Image
     * @param img2 objet Image
     * @returns la matrice binaire montrant les pixels differents
     */
    private async compareImages(img1: ImageService, img2: ImageService): Promise<Array<Array<number>>> {
        try {
            // Loading both images
            const imgMatrix1 = await img1.imageToMatrix();
            const imgMatrix2 = await img2.imageToMatrix();

            if (!imgMatrix1 || !imgMatrix2) {
                throw new Error('Images failed to load');
            }

            // Making sure that images have the same size
            if (imgMatrix1.length !== imgMatrix2.length || imgMatrix1[0].length !== imgMatrix2[0].length) {
                throw new Error("Images don't have the same size");
            }

            // Initializing the matrix of differences
            let matrixOfPixels = new Array(imgMatrix1.length);

            // Filling the matrix with zeros
            for (let i = 0; i < imgMatrix1.length; i++) {
                matrixOfPixels[i] = new Array(imgMatrix1[i].length).fill(0);
            }

            // Comparing each pixel between image 1 and image 2
            for (let i = 0; i < imgMatrix1.length; i++) {
                for (let j = 0; j < imgMatrix1[i].length; j++) {
                    if (imgMatrix1[i][j].toString() !== imgMatrix2[i][j].toString()) {
                        matrixOfPixels[i][j] = 1;
                    }
                }
            }
            return matrixOfPixels;
        } catch (err) {
            console.log(err);
        }
    }
    private calculateDifficulty(matrix: Array<Array<number>>) {
        const newMatrix = matrix.flat(1);
        const noOfOnes = newMatrix.filter((num) => {
            return num === 1;
        }).length;

        if (noOfOnes / newMatrix.length > 0.15) {
            return 'Easy';
        } else {
            return 'Hard';
        }
    }

    async getDifficultyLevel() {
        return this.calculateDifficulty(await this.compareImages(this.image1, this.image2));
    }
}
