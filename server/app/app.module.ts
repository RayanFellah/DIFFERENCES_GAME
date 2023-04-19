import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { Sheet, sheetSchema } from '@app/model/database/sheet';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GameLogicController } from './controllers/game-logic/game-logic.controller';
import { ImageController } from './controllers/image/image.controller';
import { SheetController } from './controllers/sheet/sheet.controller';
import { GameGateway } from './gateways/game/game.gateway';
import { History, historyInterface } from './model/database/history';
import { DifferenceDetectorService } from './services/difference-detector/difference-detector.service';
import { DifferenceService } from './services/difference/difference.service';
import { GameConstantsService } from './services/game-constants/game-constants.service';
import { GameEventService } from './services/game-event/game-event.service';
import { GameHistoryService } from './services/game-history/game-history.service';
import { GameLogicService } from './services/game-logic/game-logic.service';
import { GatewayLogicService } from './services/gateway-logic/gateway-logic.service';
import { ImageCompareService } from './services/image-compare/image-compare.service';
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
        MongooseModule.forFeature([
            { name: Sheet.name, schema: sheetSchema },
            { name: History.name, schema: historyInterface },
        ]),
    ],
    controllers: [SheetController, ImageController, GameLogicController],
    providers: [
        ChatGateway,
        Logger,
        SheetService,
        DifferenceDetectorService,
        ImageToMatrixService,
        DifferenceService,
        RadiusEnlargementService,
        GameLogicService,
        ImageCompareService,
        GameGateway,
        GameEventService,
        GameHistoryService,
        GameConstantsService,
        GatewayLogicService,
    ],
})
export class AppModule {}
