import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImageProcessingModule } from './image-processing/image-processing.module';
import { GameLogicModule } from './game-logic/game-logic.module';

const dbUri = 'mongodb+srv://skander:hannachi@test.n9gekl1.mongodb.net/Projet2?retryWrites=true&w=majority';
@Module({
    imports: [MongooseModule.forRoot(dbUri), ImageProcessingModule, GameLogicModule],
    controllers: [],
    providers: [Logger],
})
export class AppModule {}
