import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SheetModule } from './model/database/Sheets/sheet.module';
import { ImageProcessingModule } from './image-processing/image-processing.module';
import { ImageStorageService } from './image-processing/imagesproc/imageupload.service';

const dbUri = 'mongodb+srv://skander:hannachi@test.n9gekl1.mongodb.net/Projet2?retryWrites=true&w=majority';
@Module({
    imports: [MongooseModule.forRoot(dbUri), SheetModule, ImageProcessingModule],
    controllers: [],
    providers: [ImageStorageService],
})
export class AppModule {}
