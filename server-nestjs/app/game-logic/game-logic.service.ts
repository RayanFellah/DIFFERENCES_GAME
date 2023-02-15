import { Sheet } from '@app/model/database/Sheets/schemas/Sheet';
import { Difference } from '@app/services/difference/difference.service';
import { DifferenceDetector } from '@app/services/differences-detector/differences-detector.service';
import { ImageService } from '@app/services/Image-service/Image.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameLogicService {
    differences: Difference[];
    getDifferenceDetector(gameSheet: Partial<Sheet>) {
        const image1 = new ImageService(gameSheet.originalImagePath);
        const image2 = new ImageService(gameSheet.modifiedImagePath);
        return new DifferenceDetector(image1, image2);
    }

    async getAllDifferences(gameSheet: Partial<Sheet>) {
        const diffDetector = this.getDifferenceDetector(gameSheet);
        return await diffDetector.getAllClusters(gameSheet.radius);
    }

    async getDifficulty(gameSheet: Partial<Sheet>, length: number) {
        const diffDetector = this.getDifferenceDetector(gameSheet);
        return diffDetector.getDifficultyLevel(length);
    }

    async findDifference(gameSheet: Sheet, x: number, y: number) {
        this.differences = await this.getAllDifferences(gameSheet);
        for (let i = 0; i < this.differences.length; i++) {
            const diff = this.differences[i];
            const found = diff.coords.find((coord) => {
                return coord.posX == x && coord.posY == y; // on est conscient de prob de type
            });
            if (found) {
                return diff;
            }
        }
        return undefined;
    }
}
