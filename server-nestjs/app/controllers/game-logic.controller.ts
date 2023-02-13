import { Coord } from '@app/interfaces/Coord';
import { Sheet } from '@app/model/database/Sheets/schemas/Sheet';
import { SheetService } from '@app/model/database/Sheets/sheet.service';
import { Controller, Get, Query, Param, NotFoundException, Body, Patch } from '@nestjs/common';
import { GameLogicService } from '../game-logic/game-logic.service';
@Controller('game')
export class GameLogicController {
    constructor(private readonly gameLogicService: GameLogicService, private readonly sheetService: SheetService) {}
    @Get('/test')
    async test() {
        return 'test';
    }

    @Get('game/:sheetId')
    async startGame(@Param('sheetId') id: string) {
        try {
            const sheet: Sheet = await this.sheetService.getSheetById(id);
            const differences = await this.gameLogicService.getAllDifferences(sheet);
            this.sheetService.updateSheet(id, {
                difficulty: await this.gameLogicService.getDifficulty(sheet),
            });
            return differences.length;
        } catch (err) {
            throw new NotFoundException();
        }
    }
    @Get('game/:sheetId')
    async playerClick(@Query('x') posX: number, @Query('y') posY: number, @Param('sheetId') id: string): Promise<Coord[]> {
        const sheet = await this.sheetService.getSheetById(id);
        const difference = await this.gameLogicService.findDifference(sheet, posX, posY);
        if (difference) {
            return difference.coords;
        }
        return undefined;
    }
    @Patch('game/finish/:sheetId')
    async finishGame(id: string, @Body() data) {
        const sheet: Sheet = await this.sheetService.getSheetById(id);
        if (data.bestScore > sheet.bestScore) {
            this.sheetService.updateSheet(id, {
                bestScore: data.bestScore,
                topPlayer: data.player,
            });
        }
    }
}
