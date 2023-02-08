// eslint-disable-next-line unicorn/filename-case
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type SheetDocument = Sheet & Document;

@Schema({ collection: 'gameSheets' })
export class Sheet {
    @ApiProperty()
    @Prop()
    sheetId: string;

    @ApiProperty()
    @Prop()
    name: string;

    @ApiProperty()
    @Prop()
    bestScore: string;

    @ApiProperty()
    @Prop()
    difficulty: string;

    @ApiProperty()
    @Prop()
    topPlayer: string;

    @ApiProperty()
    @Prop()
    originalImagePath: string;

    @ApiProperty()
    @Prop()
    modifiedImagePath: string;

    @ApiProperty()
    @Prop()
    radius: number;
}

export const sheetSchema = SchemaFactory.createForClass(Sheet);
