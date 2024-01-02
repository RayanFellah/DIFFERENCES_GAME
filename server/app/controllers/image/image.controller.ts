import { ImageCompareService } from '@app/services/image-compare/image-compare.service';
import { Body, Controller, Get, HttpStatus, NotFoundException, Param, Post, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs';
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
        const imageCompareService = new ImageCompareService();
        const results: { differences: number; imageBase64: string; difficulty: string } = await imageCompareService.compareImages(
            files['originalImagePath'][0],
            files['modifiedImagePath'][0],
            formData.radius,
        );
        response.status(HttpStatus.OK).send(results);
    }
}
