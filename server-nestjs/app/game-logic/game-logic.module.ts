import { SheetModule } from '@app/model/database/Sheets/sheet.module';
import { SheetsRepository } from '@app/model/database/Sheets/sheet.repos';
import { SheetService } from '@app/model/database/Sheets/sheet.service';
import { Module } from '@nestjs/common/decorators';
import { GameLogicController } from './game-logic.controller';
import { GameLogicService } from './game-logic.service';
import { MongooseModule } from '@nestjs/mongoose';
import { sheetSchema, Sheet } from '@app/model/database/Sheets/schemas/sheet';

@Module({
    imports: [SheetModule, MongooseModule.forFeature([{ name: Sheet.name, schema: sheetSchema }])],
    controllers: [GameLogicController],
    providers: [GameLogicService, SheetService, SheetsRepository],
})
export class GameLogicModule {}
