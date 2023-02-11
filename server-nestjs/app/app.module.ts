import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImageProcessingModule } from './image-processing/image-processing.module';
import { GameLogicModule } from './game-logic/game-logic.module';

const DB_URI = 'mongodb+srv://Ekip:209@sheets.pccmn2w.mongodb.net/test';
@Module({
    imports: [MongooseModule.forRoot(DB_URI), ImageProcessingModule, GameLogicModule],
    controllers: [],
    providers: [Logger],
})
export class AppModule {}
