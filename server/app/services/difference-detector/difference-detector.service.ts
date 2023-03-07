/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-console */
import { Coord } from '@app/interfaces/coord.interface';
import { DifferenceService } from '@app/services/difference/difference.service';
import { ImageToMatrixService } from '@app/services/image-to-matrix/image-to-matrix.service';
import { RadiusEnlargementService } from '@app/services/radius-enlargement/radius-enlargement.service';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DifferenceDetectorService {
    differences: DifferenceService[] = [];
    image1: ImageToMatrixService;
    image2: ImageToMatrixService;
    /** L'objet DifferenceDetector prend deux Images en paramètre
     *
     * @param img1
     * @param img2
     */

    constructor(
        @Inject(RadiusEnlargementService) private readonly radiusEnlargementService: RadiusEnlargementService,
        @Inject(DifferenceService) private readonly differenceService: DifferenceService,
        img1: ImageToMatrixService,
        img2: ImageToMatrixService,
    ) {
        this.image1 = img1;
        this.image2 = img2;
    }
    /**
     * Cette fonction sert a chercher tous les packets de coordonnées associes a une difference
     * entre deux images et le mettre dans la liste des differences
     *
     * @param rayon : rayon d’élargissement pris en compte
     */

    async getAllClusters(rayon: number): Promise<DifferenceService[]> {
        const matrix = this.radiusEnlargementService.radiusEnlargement(await this.compareImages(this.image1, this.image2), rayon);
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                if (matrix[i][j] === 1) {
                    this.differences.push(this.getCluster(matrix, i, j));
                }
            }
        }
        return this.differences;
    }

    async getDifficultyLevel(length: number) {
        return this.calculateDifficulty(await this.compareImages(this.image1, this.image2), length);
    }

    /**
     * Cette fonction prend deux images et retourne un matrice nous donnant les pixels différents
     * entres celles-ci
     *
     * @param img1 objet Image
     * @param img2 objet Image
     * @returns la matrice binaire montrant les pixels différents
     */
    async compareImages(img1: ImageToMatrixService, img2: ImageToMatrixService): Promise<number[][]> {
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
            const matrixOfPixels = new Array(imgMatrix1.length);

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

    /**
     *
     * @param matrix une matrice binaire qui représente un pixel different par un 1et un pixel pareil par
     * un 0
     * @param i position en x du pixel different
     * @param j position en y du pixel different
     * @returns une Difference, qui est un amas de pixels différents représentes par un 1 dans la matrice
     * montrant les pixels différents
     */

    private getCluster(matrix: number[][], i: number, j: number): DifferenceService {
        const queue = [[i, j]];
        const coordList: Coord[] = [];

        while (queue.length) {
            const [x, y] = queue.shift();
            if (x < 0 || x >= matrix.length || y < 0 || y >= matrix[x].length || matrix[x][y] !== 1) continue;
            coordList.push({ posX: y, posY: x });
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
        const differenceService = new DifferenceService();
        differenceService.setCoord(coordList);
        return differenceService;
    }

    private calculateDifficulty(matrix: number[][], length: number) {
        const newMatrix = matrix.flat(1);
        const noOfOnes = newMatrix.filter((num) => {
            return num === 1;
        }).length;
        if (noOfOnes / newMatrix.length <= 0.15 && length >= 7) {
            return 'Hard';
        } else {
            return 'Easy';
        }
    }
}
