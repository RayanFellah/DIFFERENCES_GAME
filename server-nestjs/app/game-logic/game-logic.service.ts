import { DifferenceDetector } from '@app/services/differences-detector/differences-detector.service';
import { ImageService } from '@app/services/Image-service/Image.service';
import { Injectable } from '@nestjs/common';
import { Sheet } from '@app/model/database/Sheets/schemas/sheet';

@Injectable()
export class GameLogicService {
    async getAllDifferences(gameSheet: Sheet) {
        const image1 = new ImageService(gameSheet.originalImagePath);
        const image2 = new ImageService(gameSheet.modifiedImagePath);
        const diffDetector = new DifferenceDetector(image1, image2);
        return await diffDetector.getAllClusters(gameSheet.radius);
    }

    async getDifficulty() {
        return 'Hard';
    }

    async findDifference(gameSheet: Sheet, x, y) {
        const differences = await this.getAllDifferences(gameSheet);
        for (const diff of differences) {
            const found = diff.coords.find((coord) => coord.posX === x && coord.posY === y);
            if (found) {
                return diff;
            }
        }
        return undefined;
    }
}
