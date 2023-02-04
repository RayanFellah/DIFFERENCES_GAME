import { Sheet, SheetSchema } from '@app/model/database/Sheets/schemas/Sheet';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SheetsRepository } from './sheet.repos';
import { SheetService } from './sheet.service';
import { SheetController } from './sheets.controller';

@Module({
    imports: [MongooseModule.forFeature([{ name: Sheet.name, schema: SheetSchema }])],
    controllers: [SheetController],
    providers: [SheetService, SheetsRepository],
})
export class SheetModule {}
