import { GameLogicService } from '@app/game-logic/game-logic.service';
import { Body, Controller, Delete, Get, Param, Patch, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { Sheet } from './schemas/Sheet';
import { SheetService } from './sheet.service';
@Controller('sheets')
export class SheetController {
    current: Sheet;
    constructor(private readonly sheetService: SheetService, private gameLogic: GameLogicService) {}

    @Get(':sheetId')
    async getSheet(@Param('sheetId') sheetId: string): Promise<Sheet> {
        return await this.sheetService.getSheetById(sheetId);
    }

    @Get('game/current/differences')
    async getDifferences() {
        const temp = await this.sheetService.getSheetById(this.current.sheetId);
        const differences = await this.gameLogic.getAllDifferences(temp);
        return { numberDifferences: differences.length, difficulty: this.gameLogic.getDifficulty(temp, differences.length) };
    }

    @Post('game/current/:sheetId')
    async receiveSheet(@Param('sheetId') sheetId: string, @Res() res: Response) {
        try {
            console.log('got it');
            this.current = await this.sheetService.getSheetById(sheetId);
        } catch (error) {
            return new Error(error);
        }
    }

    @Get('game/current')
    async sendCurrent() {
        try {
            return await this.getSheet(this.current.sheetId);
        } catch (error) {
            return new Error('cannot get sheet');
        }
    }

    @Get()
    async getAllSheets(): Promise<Sheet[]> {
        return await this.sheetService.getSheets();
    }

    @Patch(':sheetId')
    async updateSheet(@Param('sheetId') sheetId: string, @Body() updateSheetDto: Partial<Sheet>): Promise<Sheet> {
        return await this.sheetService.updateSheet(sheetId, updateSheetDto);
    }

    @Delete()
    async deleteAllSheets() {
        await this.sheetService.deleteAllSheets();
    }
}
