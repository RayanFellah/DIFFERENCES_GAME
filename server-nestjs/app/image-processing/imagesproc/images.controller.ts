import {
    Controller,
    Get,
    Request,
    Body,
    Post,
    UploadedFile,
    BadRequestException,
    HttpException,
    Param,
    NotFoundException,
    Delete,
    UseInterceptors,
} from '@nestjs/common';
import { ImageDto } from './interfaces/image.dto';
import { ImageStorageService } from './image-storage.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import * as fs from 'fs';
import { UnsupportedMediaTypeException } from '@nestjs/common/exceptions/unsupported-media-type.exception';
@Controller('images')
export class ImagesController {
    constructor(private readonly imageStorage: ImageStorageService) {}

    @Get('test')
    async test(): Promise<string> {
        return 'ServerIsClean';
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file: Express.Multer.File, @Param('sheetId') sheetId: string) {
        if (file.mimetype !== 'image/bmp') {
            throw new UnsupportedMediaTypeException();
        }
        try {
            await this.imageStorage.uploadImage(file.buffer, sheetId, file.originalname);
        } catch (error) {
            throw new BadRequestException();
        }
        return 'uploaded';
    }
    @Get()
    async getAllImages() {
        try {
            return await this.imageStorage.getAllImages();
        } catch (error) {
            throw new NotFoundException();
        }
    }

    @Get(':id')
    async getImageById(@Param('id') id: string): Promise<ImageDto> {
        try {
            return await this.imageStorage.findImageById(id);
        } catch (error) {
            throw new NotFoundException({ cause: new Error(), description: 'this image is not stored' });
        }
    }
    @Delete(':id')
    async deleteImage(@Param('id') id: string): Promise<void> {
        try {
            await this.imageStorage.deleteImage(id);
        } catch (error) {
            throw new NotFoundException({ cause: new Error(), description: 'this image is not stored' });
        }
    }
}
