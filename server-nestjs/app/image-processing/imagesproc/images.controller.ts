import { generateRandomId } from '@app/services/randomID/random-id';
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    NotFoundException,
    Param,
    Query,
    Post,
    Res,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBadRequestResponse, ApiBody, ApiConsumes, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ImageStorageService } from './image-storage.service';
import { ImageDto } from './interfaces/image.dto';
import { GameLogicService } from '@app/game-logic/game-logic.service';
import { SheetService } from '@app/model/database/Sheets/sheet.service';
import * as path from 'path';
@ApiTags('Images')
@Controller('images')
export class ImagesController {
    constructor(
        private readonly imageStorage: ImageStorageService,
        private readonly logicService: GameLogicService,
        private readonly sheetService: SheetService,
    ) {}

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
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'original', maxCount: 1 },
            { name: 'modified', maxCount: 1 },
        ]),
    )
    async uploadFile(
        @Body() body: unknown,
        @UploadedFiles() files: { original: Express.Multer.File[]; modified: Express.Multer.File[] },
        @Res() res: Response,
    ) {
        try {
            const sheetId = generateRandomId();
            const original = await this.imageStorage.uploadImage(files.original[0].buffer, sheetId, files.original[0].originalname, true);
            const modified = await this.imageStorage.uploadImage(files.modified[0].buffer, sheetId, files.modified[0].originalname, false);
            const sheet = await this.sheetService.createSheet('name', sheetId, original.path, modified.path, 1);
            const diffs = await this.logicService.getAllDifferences(sheet);

            return res.status(HttpStatus.CREATED).send({ message: 'files have been uploaded', differences: diffs.length });
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).send('Could not upload dem files');
        }
    }
    @Get(':sheetId')
    async getImage(@Param('sheetId') sheetId: string, @Query() query, @Res() res: Response) {
        try {
            const nature = query.original === 'true' ? true : false;
            const imagePath = await this.imageStorage.getImagePath(sheetId, nature);
            return res.sendFile(imagePath);
        } catch (error) {
            return res.status(HttpStatus.NOT_FOUND).send({ message: error.message });
        }
    }
}
