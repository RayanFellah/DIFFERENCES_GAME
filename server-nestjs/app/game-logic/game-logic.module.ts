import { Sheet, sheetSchema } from '@app/model/database/Sheets/schemas/Sheet';
import { SheetModule } from '@app/model/database/Sheets/sheet.module';
import { SheetsRepository } from '@app/model/database/Sheets/sheet.repos';
import { SheetService } from '@app/model/database/Sheets/sheet.service';
import { Module } from '@nestjs/common/decorators';
import { MongooseModule } from '@nestjs/mongoose';
import { GameLogicController } from './game-logic.controller';
import { GameLogicService } from './game-logic.service';

@Module({
    imports: [SheetModule, MongooseModule.forFeature([{ name: Sheet.name, schema: sheetSchema }])],
    controllers: [GameLogicController],
    providers: [GameLogicService, SheetService, SheetsRepository],
})
export class GameLogicModule {}
