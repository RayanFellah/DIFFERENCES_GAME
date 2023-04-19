/* eslint-disable no-underscore-dangle */
import { Sheet } from '@app/model/database/sheet';
import { GameLogicService } from '@app/services/game-logic/game-logic.service';
import { SheetService } from '@app/services/sheet/sheet.service';
import { Controller, Get, Param, Query } from '@nestjs/common';
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

    @Get('current/allDifferences/:id')
    async getAllDifferences(@Param('id') id: string) {
        const sheet = await this.sheetService.getSheet(id);
        const arr = [];
        const diffs = await this.gameLogicService.getAllDifferences(sheet);
        for (const d of diffs) {
            arr.push(d.coords);
        }
        return arr;
    }
}
