import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type HistoryDocument = History & Document;

@Schema()
export class History {
    @ApiProperty()
    @Prop({ required: true })
    gameStart: string;

    @ApiProperty()
    @Prop({ required: true })
    duration: string;

    @ApiProperty()
    @Prop({ required: true })
    gameMode: string;

    @ApiProperty()
    @Prop({ required: true })
    player1: string;

    @ApiProperty()
    @Prop({ required: true })
    winner1: boolean;

    @ApiProperty()
    @Prop({ required: true })
    gaveUp1: boolean;

    @ApiProperty()
    @Prop({ required: false })
    player2: string;

    @ApiProperty()
    @Prop({ required: false })
    winner2: boolean;

    @ApiProperty()
    @Prop({ required: false })
    gaveUp2: boolean;
}

export const historyInterface = SchemaFactory.createForClass(History);
