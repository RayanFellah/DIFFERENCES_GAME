import { Sheet } from '@app/model/database/sheet';
import { CreateSheetDto } from '@app/model/dto/sheet/create-sheet.dto';
import { UpdateSheetDto } from '@app/model/dto/sheet/update-sheet.dto';
import { SheetService } from '@app/services/sheet/sheet.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { createWriteStream } from 'fs';

@ApiTags('Sheets')
@Controller('sheet')
export class SheetController {
    constructor(private readonly sheetService: SheetService) {}

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
    @Get('/:id')
    async id(@Param('id') id: string, @Res() response: Response) {
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
            for (const key in files) {
                if (files[key]) {
                    const file: Express.Multer.File = files[key][0];
                    const fileName = file.originalname;
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
            sheetDto.radius = formData.radius.toString();
            await this.sheetService.addSheet(sheetDto);
            response.status(HttpStatus.CREATED).send();
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
