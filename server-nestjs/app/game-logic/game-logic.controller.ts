import { Coord } from '@app/interfaces/Coord';
import { Sheet } from '@app/model/database/Sheets/schemas/Sheet';
import { SheetService } from '@app/model/database/Sheets/sheet.service';
import { Controller, Get, Put, Query, Param, NotFoundException, Body, Post, Patch } from '@nestjs/common';
import { GameLogicService } from './game-logic.service';
@Controller('game')
export class GameLogicController {
    games: [{ player: string; sheet: Sheet }];

    constructor(private readonly gameLogicService: GameLogicService, private readonly sheetService: SheetService) {}
    @Get('/test')
    async test() {
        return 'test';
    }

    @Post('select/:sheetId')
    async loadGameSheet(@Param('sheetId') sheetId: string, @Query('player') name: string) {
        const found = await this.sheetService.getSheetById(sheetId);
        if (found) {
            this.games.push({ player: name, sheet: found });
            return 'sheet added to waiting list';
        } else {
            return 'not found';
        }
    }
    @Get('start')
    async startGame() {
        try {
            const sheet = this.games[0].sheet;
            const differences = await this.gameLogicService.getAllDifferences(sheet);
            this.sheetService.updateSheet(sheet.sheetId, {
                difficulty: await this.gameLogicService.getDifficulty(sheet),
            });
            this.games.length = 1;
            return {
                numberOfdiffs: differences.length,
                gameSheet: sheet,
            };
        } catch (err) {
            throw new NotFoundException();
        }
    }
    @Get(':sheetId')
    async playerClick(@Query('x') posX: number, @Query('y') posY: number, @Param('sheetId') id: string) {
        const sheet = await this.sheetService.getSheetById(id);
        const difference = await this.gameLogicService.findDifference(sheet, posX, posY);
        if (difference) {
            return difference.coords;
        }
        return {
            message: 'non',
        };
    }
    @Patch('finish/:sheetId')
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
