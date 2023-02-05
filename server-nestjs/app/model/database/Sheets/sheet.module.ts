import { Sheet, sheetSchema } from '@app/model/database/Sheets/schemas/sheet';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SheetsRepository } from './sheet.repos';
import { SheetService } from './sheet.service';
import { SheetController } from './sheets.controller';

@Module({
    imports: [MongooseModule.forFeature([{ name: Sheet.name, schema: sheetSchema }])],
    controllers: [SheetController],
    providers: [SheetService, SheetsRepository],
})
export class SheetModule {}
