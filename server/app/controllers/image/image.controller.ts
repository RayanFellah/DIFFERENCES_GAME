import { BLACK, HEIGHT, WHITE, WIDTH } from '@app/constants';
import { Buffers } from '@app/interfaces/buffers.interface';
import { DifferenceDetectorService } from '@app/services/difference-detector/difference-detector.service';
import { DifferenceService } from '@app/services/difference/difference.service';
import { ImageToMatrixService } from '@app/services/image-to-matrix/image-to-matrix.service';
import { RadiusEnlargementService } from '@app/services/radius-enlargement/radius-enlargement.service';
import { Body, Controller, Get, HttpStatus, NotFoundException, Param, Post, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs';
import * as Jimp from 'jimp';
import * as path from 'path';

@ApiTags('images')
@Controller('image')
export class ImageController {
    @Get('/:filename')
    async serveImage(@Param('filename') filename: string, @Res() res: Response) {
        const imagePath = path.join(process.cwd(), 'uploads', filename);
        if (fs.existsSync(imagePath)) {
            res.sendFile(imagePath);
        } else {
            throw new NotFoundException('Example not found');
        }
    }
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'originalImagePath', maxCount: 1 },
            { name: 'modifiedImagePath', maxCount: 1 },
        ]),
    )
    @Post('compare')
    async compareImages(
        @Body() formData,
        @UploadedFiles() files: { originalImagePath: Express.Multer.File[]; modifiedImagePath: Express.Multer.File[] },
        @Res() response: Response,
    ): Promise<void> {
        try {
            const buffers: Buffers = { originalImagePath: null, modifiedImagePath: null };
            for (const key in files) {
                if (files[key]) {
                    const file: Express.Multer.File = files[key][0];
                    buffers[key] = file.buffer;
                }
            }
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
            const differences = await differenceDetector.getAllClusters(formData.radius);
            const image = new Jimp(WIDTH, HEIGHT, WHITE);

            for (const dif of differences) {
                for (const coord of dif.coords) {
                    image.setPixelColor(BLACK, coord.posX, coord.posY);
                }
            }

            // Save the image as a BMP file and send it as the response
            const imageBuffer: Buffer = await image.getBufferAsync('image/bmp');
            const imageBase64: string = imageBuffer.toString('base64');
            response.status(HttpStatus.OK).send({ differences: differences.length, imageBase64 });
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }
}
