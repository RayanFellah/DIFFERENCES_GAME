import { Controller, Get, Body, Post, Response, BadRequestException, HttpException, Param, NotFoundException, Delete, UseInterceptors } from '@nestjs/common';
import { ImageDto } from './interfaces/image.dto';
import { ImageStorageService } from './imageupload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
@Controller('images')
export class ImagesController {
    constructor(private readonly imageStorage: ImageStorageService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('image'))
    async uploadImage(@Body() image: Express.Multer.File, @Param('sheetId') sheetId: string): Promise<string> {
        try {
            console.log('init');
            await this.imageStorage.uploadImage(image, sheetId);
            return 'uploaded successfully';
        } catch (error) {
            throw new BadRequestException({ cause: new Error(), description: 'Could not upload the file' });
        }
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
