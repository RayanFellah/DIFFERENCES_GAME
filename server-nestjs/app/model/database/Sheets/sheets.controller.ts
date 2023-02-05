import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateSheetDto } from './dto/create-sheet.dto';
import { UpdateSheetDto } from './dto/update-sheet.dto';
import { Sheet } from './schemas/sheet';
import { SheetService } from './sheet.service';
@Controller('sheets')
export class SheetController {
    constructor(private readonly sheetService: SheetService) {}

    @Get(':sheetId')
    async getSheet(@Param('sheetId') sheetId: string): Promise<Sheet> {
        return this.sheetService.getSheetById(sheetId);
    }

    @Get()
    async getAllSheets(): Promise<Sheet[]> {
        return this.sheetService.getSheets();
    }

    @Post()
    async createSheet(@Body() createSheetDto: CreateSheetDto): Promise<Sheet> {
        return this.sheetService.createSheet(createSheetDto.name, createSheetDto.difficulty);
    }

    @Patch(':sheetId')
    async updateSheet(@Param('sheetId') sheetId: string, @Body() updateSheetDto: UpdateSheetDto): Promise<Sheet> {
        return this.sheetService.updateSheet(sheetId, updateSheetDto);
    }
}
