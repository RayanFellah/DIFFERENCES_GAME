import { BLACK, HEIGHT, WHITE, WIDTH } from '@app/constants';
import { Buffers } from '@app/interfaces/buffers.interface';
import { DifferenceDetectorService } from '@app/services/difference-detector/difference-detector.service';
import { DifferenceService } from '@app/services/difference/difference.service';
import { ImageToMatrixService } from '@app/services/image-to-matrix/image-to-matrix.service';
import { RadiusEnlargementService } from '@app/services/radius-enlargement/radius-enlargement.service';
import { Injectable } from '@nestjs/common';
import * as Jimp from 'jimp';
@Injectable()
export class ImageCompareService {
    async compareImages(
        originalImagePath: Express.Multer.File,
        modifiedImagePath: Express.Multer.File,
        radius: string,
    ): Promise<{ differences: number; imageBase64: string; difficulty: string }> {
        try {
            const buffers: Buffers = { originalImagePath: null, modifiedImagePath: null };
            buffers['originalImagePath'] = originalImagePath.buffer;
            buffers['modifiedImagePath'] = modifiedImagePath.buffer;
            const image1: ImageToMatrixService = new ImageToMatrixService();
            image1.setFile(buffers['originalImagePath']);
            const image2: ImageToMatrixService = new ImageToMatrixService();
            image2.setFile(buffers['modifiedImagePath']);
            const differenceDetector: DifferenceDetectorService = new DifferenceDetectorService(
                new RadiusEnlargementService(),
                new DifferenceService(),
                image1,
                image2,
            );
            const differences = await differenceDetector.getAllClusters(parseInt(radius, 10));
            const image = new Jimp(WIDTH, HEIGHT, WHITE);
            const difficulty = await differenceDetector.getDifficultyLevel(differences.length);
            for (const dif of differences) {
                for (const coord of dif.coords) {
                    image.setPixelColor(BLACK, coord.posX, coord.posY);
                }
            }

            // Save the image as a BMP file and send it as the response
            const imageBuffer: Buffer = await image.getBufferAsync('image/bmp');
            const imageBase64: string = imageBuffer.toString('base64');
            return { differences: differences.length, imageBase64, difficulty };
        } catch (error) {
            return error.message;
        }
    }
}
