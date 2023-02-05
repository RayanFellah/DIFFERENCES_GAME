import { SheetService } from '@app/model/database/Sheets/sheet.service';
import { Controller, Get, Post, Query } from '@nestjs/common';
import { GameLogicService } from './game-logic.service';

@Controller('game')
export class GameLogicController {
    constructor(private readonly gameLogicService: GameLogicService, private readonly sheetService: SheetService) {}
    @Get('/test')
    async test() {
        return 'test';
    }

    @Post('game')
    async playerClick(@Query('x') posX: number, @Query('y') posY: number) {
        const difference = this.gameLogicService.findDifference(this.sheetService.getSheets(), posX, posY);
    }
}
