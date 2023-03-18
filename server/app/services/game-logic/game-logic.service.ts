import { Sheet } from '@app/model/database/sheet';
import { DifferenceDetectorService } from '@app/services/difference-detector/difference-detector.service';
import { DifferenceService } from '@app/services/difference/difference.service';
import { ImageToMatrixService } from '@app/services/image-to-matrix/image-to-matrix.service';
import { RadiusEnlargementService } from '@app/services/radius-enlargement/radius-enlargement.service';
import { Injectable } from '@nestjs/common';
import * as Jimp from 'jimp';
import * as path from 'path';
@Injectable()
export class GameLogicService {
    differences: DifferenceService[] = [];
    async getDifferenceDetector(gameSheet: Partial<Sheet>) {
        const image1 = new ImageToMatrixService();
        const image1Path = path.join(process.cwd(), 'uploads', gameSheet.originalImagePath);
        // eslint-disable-next-line import/namespace
        const image1Buffer = await (await Jimp.read(image1Path)).getBufferAsync(Jimp.MIME_BMP);
        image1.setFile(image1Buffer);
        const image2 = new ImageToMatrixService();
        const image2Path = path.join(process.cwd(), 'uploads', gameSheet.modifiedImagePath);
        const image2Buffer = await (await Jimp.read(image2Path)).getBufferAsync(Jimp.MIME_BMP);
        image2.setFile(image2Buffer);
        return new DifferenceDetectorService(new RadiusEnlargementService(), new DifferenceService(), image1, image2);
    }

    async getAllDifferences(gameSheet: Partial<Sheet>) {
        const diffDetector = await this.getDifferenceDetector(gameSheet);
        return await diffDetector.getAllClusters(gameSheet.radius);
    }

    async getDifficulty(gameSheet: Sheet) {
        const diffDetector = await this.getDifferenceDetector(gameSheet);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return diffDetector.getDifficultyLevel(7);
    }

    async findDifference(gameSheet: Sheet, x: number, y: number) {
        this.differences = await this.getAllDifferences(gameSheet);
        for (const diff of this.differences) {
            const found = diff.coords.find((coord) => {
                return coord.posX === x && coord.posY === y;
            });
            if (found) {
                return diff;
            }
        }
        return undefined;
    }
}
