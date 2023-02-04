import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SheetModule } from './model/database/Sheets/sheet.module';

@Module({
    imports: [MongooseModule.forRoot('mongodb+srv://skander:hannachi@test.n9gekl1.mongodb.net/Projet2?retryWrites=true&w=majority'), SheetModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
