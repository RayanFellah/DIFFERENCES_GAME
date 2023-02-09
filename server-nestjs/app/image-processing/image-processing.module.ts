import { SheetModule } from '@app/model/database/Sheets/sheet.module';
import { SheetsRepository } from '@app/model/database/Sheets/sheet.repos';
import { SheetService } from '@app/model/database/Sheets/sheet.service';
import { Module } from '@nestjs/common/decorators';
import { GameLogicController } from '@app/game-logic/game-logic.controller';
import { GameLogicService } from '@app/game-logic/game-logic.service';
import { MongooseModule } from '@nestjs/mongoose';
import { sheetSchema, Sheet } from '@app/model/database/Sheets/schemas/Sheet';
import { ImagesController } from './imagesproc/images.controller';
import { ImageStorageService } from './imagesproc/image-storage.service';

@Module({
    imports: [SheetModule, MongooseModule.forFeature([{ name: Sheet.name, schema: sheetSchema }])],
    controllers: [GameLogicController, ImagesController],
    providers: [GameLogicService, SheetService, SheetsRepository, ImageStorageService],
})
export class ImageProcessingModule {}
