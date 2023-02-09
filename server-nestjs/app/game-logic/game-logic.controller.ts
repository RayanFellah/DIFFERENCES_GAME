import { Coord } from '@app/interfaces/Coord';
import { Sheet } from '@app/model/database/Sheets/schemas/sheet';
import { SheetService } from '@app/model/database/Sheets/sheet.service';
import { Controller, Get, Query, Param, NotFoundException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GameLogicService } from './game-logic.service';
@ApiTags('Game')
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
                difficulty: await this.gameLogicService.getDifficulty(),
            });
            return differences.length;
        } catch (err) {
            throw new NotFoundException();
        }
    }
}
