import { Score } from '@common/score';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type SheetDocument = Sheet & Document;

@Schema()
export class Sheet {
    @ApiProperty()
    @Prop({ required: true })
    title: string;

    @ApiProperty()
    @Prop({ required: true })
    difficulty: string;

    @ApiProperty()
    @Prop({ required: true })
    radius: number;

    @ApiProperty()
    @Prop({ required: true })
    originalImagePath: string;

    @ApiProperty()
    @Prop({ required: true })
    modifiedImagePath: string;

    @ApiProperty()
    @Prop({ required: false })
    top3Solo: Score[];

    @ApiProperty()
    @Prop({ required: false })
    top3Multi: Score[];

    @ApiProperty()
    _id: string;

    @ApiProperty()
    @Prop({ required: true })
    differences: number;

    @ApiProperty()
    @Prop({ required: true })
    isJoinable: boolean;
}

export const sheetSchema = SchemaFactory.createForClass(Sheet);
