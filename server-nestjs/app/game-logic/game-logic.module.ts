import { SheetModule } from '@app/model/database/Sheets/sheet.module';
import { SheetsRepository } from '@app/model/database/Sheets/sheet.repos';
import { SheetService } from '@app/model/database/Sheets/sheet.service';
import { Module } from '@nestjs/common/decorators';
import { GameLogicController } from './game-logic.controller';
import { GameLogicService } from './game-logic.service';

@Module({
    imports: [SheetModule],
    controllers: [GameLogicController],
    providers: [GameLogicService, SheetService, SheetsRepository],
})
export class GameLogicModule {}
