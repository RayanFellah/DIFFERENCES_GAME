/* eslint-disable no-underscore-dangle */
import { Sheet } from '@app/model/database/sheet';
import { UpdateSheetDto } from '@app/model/dto/sheet/update-sheet.dto';
import { GameLogicService } from '@app/services/game-logic/game-logic.service';
import { SheetService } from '@app/services/sheet/sheet.service';
import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('game')
@Controller('game')
export class GameLogicController {
    current: Sheet;
    constructor(private readonly gameLogicService: GameLogicService, private readonly sheetService: SheetService) {}

    @Get(':sheetId')
    async playerClick(@Query('x') posX: string, @Query('y') posY: string, @Param('sheetId') id: string) {
        const sheet = await this.sheetService.getSheet(id);
        const difference = await this.gameLogicService.findDifference(sheet, parseInt(posX, 10), parseInt(posY, 10));
        if (difference) {
            return difference.coords;
        } else return undefined;
    }

    @Patch('finish/:sheetId')
    async finishGame(id: string, @Body() data) {
        const sheet: Sheet = await this.sheetService.getSheet(id);
        if (data.bestScore > sheet.topScore) {
            const updates = new UpdateSheetDto();
            updates.topPlayer = data.playerName;
            updates.topScore = data.bestScore;
            await this.sheetService.modifySheet(updates);
        }
    }
}