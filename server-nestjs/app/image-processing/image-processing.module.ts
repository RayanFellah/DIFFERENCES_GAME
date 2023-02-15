import { GameLogicController } from '@app/game-logic/game-logic.controller';
import { GameLogicService } from '@app/game-logic/game-logic.service';
import { Sheet, sheetSchema } from '@app/model/database/Sheets/schemas/Sheet';
import { SheetModule } from '@app/model/database/Sheets/sheet.module';
import { SheetsRepository } from '@app/model/database/Sheets/sheet.repos';
import { SheetService } from '@app/model/database/Sheets/sheet.service';
import { Module } from '@nestjs/common/decorators';
import { MongooseModule } from '@nestjs/mongoose';
import { ImageStorageService } from './imagesproc/image-storage.service';
import { ImagesController } from './imagesproc/images.controller';

@Module({
    imports: [SheetModule, MongooseModule.forFeature([{ name: Sheet.name, schema: sheetSchema }])],
    controllers: [GameLogicController, ImagesController],
    providers: [GameLogicService, SheetService, SheetsRepository, ImageStorageService],
})
export class ImageProcessingModule {}
