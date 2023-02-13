import { GameLogicService } from '@app/game-logic/game-logic.service';
import { SheetService } from '@app/model/database/Sheets/sheet.service';
import { Sheet } from '@app/services/differences-detector/interfaces/sheet';
import { generateRandomId } from '@app/services/randomID/random-id';
import { Controller, Get, HttpStatus, Param, Post, Query, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ImageStorageService } from './image-storage.service';
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

    @Post('upload')
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'original', maxCount: 1 },
            { name: 'modified', maxCount: 1 },
        ]),
    )
    async uploadFile(
        @UploadedFiles() files: { original: Express.Multer.File[]; modified: Express.Multer.File[] },
        @Res() res: Response,
        @Query('valid') valid: string,
        @Query('radius') radius: string,
        @Query('title') title: string,
    ) {
        try {
            const sheetId = generateRandomId();
            console.log(files.original[0].buffer);
            const original = await this.imageStorage.uploadImage(files.original[0].buffer, sheetId, files.original[0].originalname, true);
            const modified = await this.imageStorage.uploadImage(files.modified[0].buffer, sheetId, files.modified[0].originalname, false);
            console.log('modified');
            console.log('apres le upload');
            if (valid === 'true') {
                console.log(title);
                console.log('aaa');
                await this.sheetService.createSheet(title, sheetId, original.path, modified.path, parseInt(radius, 10));
            }
            const partial: Partial<Sheet> = {
                originalImagePath: original.path,
                modifiedImagePath: modified.path,
                radius: parseInt(radius, 10),
            };
            const diffs = await this.logicService.getAllDifferences(partial);
            let validated = true;
            const diffMax = 9;
            const diffMin = 3;
            if (diffs.length < diffMin && diffs.length > diffMax) {
                validated = false;
            }

            return res.status(HttpStatus.CREATED).send({
                message: 'files have been uploaded',
                differences: diffs.length,
                isValid: validated,
                gameId: validated ? sheetId : 'not defined',
            });
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).send('Could not upload dem files');
        }
    }
    @Get(':sheetId')
    async getImage(@Param('sheetId') sheetId: string, @Query() query, @Res() res: Response) {
        try {
            const nature = query.original === 'true' ? true : false;

            const imagePath = await this.imageStorage.getImagePath(sheetId, nature);
            if (imagePath) {
                return res.sendFile(imagePath);
            } else return;
        } catch (error) {
            return res.status(HttpStatus.NOT_FOUND).send({ message: error.message });
        }
    }
}
