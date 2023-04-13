import { MAX_DIFFERENCES, MIN_DIFFERENCES } from '@app/constants';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { Sheet } from '@app/model/database/sheet';
import { CreateSheetDto } from '@app/model/dto/sheet/create-sheet.dto';
import { UpdateSheetDto } from '@app/model/dto/sheet/update-sheet.dto';
import { ImageCompareService } from '@app/services/image-compare/image-compare.service';
import { SheetService } from '@app/services/sheet/sheet.service';
import { scores } from '@common/score';
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { createWriteStream } from 'fs';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const randomString = require('randomstring');
@ApiTags('Sheets')
@Controller('sheet')
export class SheetController {
    constructor(private readonly sheetService: SheetService, private readonly chatGateway: ChatGateway) {}

    @ApiOkResponse({
        description: 'Returned all sheets',
        type: Sheet,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status request fails',
    })
    @Get('/')
    async allSheets(@Res() response: Response) {
        try {
            const allSheets = await this.sheetService.getAllSheets();
            response.status(HttpStatus.OK).json(allSheets);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Get sheet by id',
        type: Sheet,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/:_id')
    async id(@Param('_id') id: string, @Res() response: Response) {
        try {
            const sheet = await this.sheetService.getSheet(id);
            response.status(HttpStatus.OK).json(sheet);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiCreatedResponse({
        description: 'Add new sheet',
    })
    @ApiNotFoundResponse({
        description: 'RETURN NOT_FOUND http status when request fails',
    })
    @Post()
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'originalImagePath', maxCount: 1 },
            { name: 'modifiedImagePath', maxCount: 1 },
        ]),
    )
    async addSheet(
        @Body() formData,
        @UploadedFiles() files: { originalImagePath: Express.Multer.File[]; modifiedImagePath: Express.Multer.File[] },
        @Res() response: Response,
    ) {
        try {
            const sheetDto = new CreateSheetDto();
            const uploadedFilesPaths = {};
            const imageCompareService = new ImageCompareService();
            const results: { differences: number; imageBase64: string; difficulty: string } = await imageCompareService.compareImages(
                files['originalImagePath'][0],
                files['modifiedImagePath'][0],
                formData.radius,
            );
            if (results.differences > MIN_DIFFERENCES && results.differences < MAX_DIFFERENCES) {
                for (const key in files) {
                    if (files[key]) {
                        const file: Express.Multer.File = files[key][0];
                        const fileName = file.originalname + randomString.generate();
                        const filePath = `./uploads/${fileName}`;
                        const imageStream = createWriteStream(filePath);
                        if (!file) {
                            throw new Error('Upload-Failed');
                        }
                        imageStream.write(file.buffer);
                        imageStream.end();
                        uploadedFilesPaths[key] = fileName;
                    }
                }
                sheetDto.title = formData.title.toString();
                sheetDto.originalImagePath = uploadedFilesPaths['originalImagePath'];
                sheetDto.modifiedImagePath = uploadedFilesPaths['modifiedImagePath'];
                sheetDto.radius = formData.radius;
                sheetDto.differences = results.differences;
                sheetDto.difficulty = results.difficulty;
                sheetDto.isJoinable = false;
                const index = sheetDto.title.charCodeAt(0) % scores.length;
                sheetDto.top3Solo = scores[index];
                sheetDto.top3Multi = scores[(index * 3) % scores.length];
                await this.sheetService.addSheet(sheetDto);
                response.status(HttpStatus.CREATED).send({ image: results.imageBase64 });
            } else throw new Error('Vous devez avoir entre 3 et 9 différences, vous en avez ' + results.differences);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Modify a sheet',
    })
    @ApiNotFoundResponse({
        description: 'RETURN NOT_FOUND http status when request fails',
    })
    @Patch('/')
    async modifySheet(@Body() sheetDto: UpdateSheetDto, @Res() response: Response) {
        try {
            await this.sheetService.modifySheet(sheetDto);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Delete a sheet',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Delete('/:id')
    async deleteSheet(@Param('id') id: string, @Res() response: Response) {
        try {
            await this.sheetService.deleteSheet(id);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }
}
