import { DateController } from '@app/controllers/date/date.controller';
import { ExampleController } from '@app/controllers/example/example.controller';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { Sheet, sheetSchema } from '@app/model/database/sheet';
import { DateService } from '@app/services/date/date.service';
import { ExampleService } from '@app/services/example/example.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ImageController } from './controllers/image/image.controller';
import { SheetController } from './controllers/sheet/sheet.controller';
import { DifferenceDetectorService } from './services/difference-detector/difference-detector.service';
import { DifferenceService } from './services/difference/difference.service';
import { ImageToMatrixService } from './services/image-to-matrix/image-to-matrix.service';
import { RadiusEnlargementService } from './services/radius-enlargement/radius-enlargement.service';
import { SheetService } from './services/sheet/sheet.service';
@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env
            }),
        }),
        MongooseModule.forFeature([{ name: Sheet.name, schema: sheetSchema }]),
    ],
    controllers: [DateController, ExampleController, SheetController, ImageController],
    providers: [
        ChatGateway,
        DateService,
        ExampleService,
        Logger,
        SheetService,
        DifferenceDetectorService,
        ImageToMatrixService,
        DifferenceService,
        RadiusEnlargementService,
    ],
})
export class AppModule {}
