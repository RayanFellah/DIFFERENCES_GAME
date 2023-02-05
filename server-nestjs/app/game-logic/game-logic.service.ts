import { GameSheet } from '@app/interfaces/GameSheet';
import { DifferenceDetector } from '@app/services/differences-detector/differences-detector.service';
import { ImageService } from '@app/services/Image-service/Image.service';
import { Injectable } from '@nestjs/common';
export class ImageDto {
    id: string;
    name: string;
    sheetId: string;
    path: string;
}

@Injectable()
export class GameLogicService {
    dataPath: string = './app/game-logic/data/game-logic.json';

    async findAllGameSheets() {}
    async findGameSheetById(sheetId: string) {
        return;
    }
    async getAllDifferences(gameSheet: GameSheet) {
        const image1 = new ImageService(gameSheet.originalImagePath);
        const image2 = new ImageService(gameSheet.modifiedImagePath);
        const diffDetector = new DifferenceDetector(image1, image2);
        return diffDetector.getAllClusters(gameSheet.radius);
    }

    async findDifference(gameSheet: GameSheet, x, y) {
        for (const diff of gameSheet.differences) {
            const found = diff.find((coord) => coord.posX === x && coord.posY === y);
            if (found) {
                return diff;
            }
        }
    }

    async addGameSheet() {}
}

/*GameSheet:
    

*/
