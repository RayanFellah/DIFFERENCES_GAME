import {
    Controller,
    Get,
    Res,
    Body,
    Post,
    UploadedFile,
    BadRequestException,
    Param,
    NotFoundException,
    Delete,
    UseInterceptors,
    HttpStatus,
    UploadedFiles,
} from '@nestjs/common';
import { ImageDto } from './interfaces/image.dto';
import { ImageStorageService } from './image-storage.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Express, Request, Response } from 'express';
import * as fs from 'fs';
import {
    ApiConsumes,
    ApiBody,
    ApiTags,
    ApiBodyOptions,
    ApiOkResponse,
    ApiNotFoundResponse,
    ApiCreatedResponse,
    ApiBadRequestResponse,
    ApiResponse,
} from '@nestjs/swagger';
import { generateRandomId } from '@app/services/randomID/random-id';
import { UnsupportedMediaTypeException } from '@nestjs/common/exceptions/unsupported-media-type.exception';

@ApiTags('Images')
@Controller('images')
export class ImagesController {
    constructor(private readonly imageStorage: ImageStorageService) {}

    @Get('test')
    async test(): Promise<string> {
        return 'ServerIsClean';
    }

    @ApiCreatedResponse({
        description: 'uploaded files successfully',
    })
    @ApiBadRequestResponse({
        description: 'Cant upload these files',
    })
    @Post('upload')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array', // 👈  array of files
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                },
            },
        },
    })
    @UseInterceptors(FilesInterceptor('files'))
    async uploadImages(@UploadedFiles() files: Express.Multer.File[], @Res() res: Response) {
        try {
            const sheetId = generateRandomId();
            for (const file of files) {
                await this.imageStorage.uploadImage(file.buffer, sheetId, file.originalname);
            }
            return res.status(HttpStatus.CREATED).send('files have been uploaded');
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).send('Could not upload dem files');
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

    // @ApiOkResponse({
    //     description: 'images sent to client',
    //     isArray: true,
    // })
    // @ApiNotFoundResponse({
    //     description: 'Could not find the images associated to this sheetId',
    // })
    @Get(':sheetId')
    async getImagesBySheetId(@Param('sheetId') sheetId: string, @Res() res: Response) {
        try {
            console.log('test');
            const images = await this.imageStorage.sendImagesFromSheetId(sheetId);
            return res.send
        } catch (error) {
            return res.status(HttpStatus.NOT_FOUND).send(error.message);
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
