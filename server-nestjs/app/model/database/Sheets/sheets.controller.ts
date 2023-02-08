import { Body, Controller, Get, HttpStatus, Param, Patch, Post, Res } from '@nestjs/common';
import { CreateSheetDto } from './dto/create-sheet.dto';
import { UpdateSheetDto } from './dto/update-sheet.dto';
import { Sheet } from './schemas/Sheet';
import { SheetService } from './sheet.service';
import { Express, Request, Response } from 'express';
import {
    ApiAcceptedResponse,
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
@ApiTags('Sheets')
@Controller('sheets')
export class SheetController {
    constructor(private readonly sheetService: SheetService) {}

    @ApiOkResponse({
        description: 'Getting sheet by its Id',
        type: Sheet,
    })
    @ApiNotFoundResponse({
        description: 'Could not find this sheet',
    })
    @Get(':sheetId')
    // eslint-disable-next-line @typescript-eslint/no-shadow
    async getSheet(@Param('sheetId') sheetId: string, @Res() response: Response): Promise<Sheet> {
        try {
            return this.sheetService.getSheetById(sheetId);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Returns all the sheets in the database',
        type: Sheet,
        isArray: true,
    })
    @ApiNoContentResponse({
        description: 'Nothing to get here',
    })
    @Get()
    async getAllSheets(@Res() response: Response): Promise<Sheet[]> {
        try {
            return this.sheetService.getSheets();
        } catch (error) {
            response.status(HttpStatus.NO_CONTENT).send(error.message);
        }
    }

    @ApiCreatedResponse({
        description: 'sheet Added successfully !',
        type: Sheet,
    })
    @ApiBadRequestResponse({
        description: 'Could not create a sheet',
    })
    @Post()
    async createSheet(@Body() createSheetDto: CreateSheetDto, @Res() response: Response): Promise<Sheet> {
        try {
            return this.sheetService.createSheet(createSheetDto.name, createSheetDto.difficulty);
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }

    @ApiAcceptedResponse({
        description: 'sheet updated',
        type: Sheet,
    })
    @ApiBadRequestResponse({
        description: 'No sheet was updated',
    })
    @Patch(':sheetId')
    async updateSheet(@Param('sheetId') sheetId: string, @Body() updateSheetDto: UpdateSheetDto, @Res() response: Response): Promise<Sheet> {
        try {
            return this.sheetService.updateSheet(sheetId, updateSheetDto);
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }
}
