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
    @Prop({ required: false })
    difficulty: number;

    @ApiProperty()
    @Prop({ required: true })
    radius: string;

    @ApiProperty()
    @Prop({ required: true })
    originalImagePath: string;

    @ApiProperty()
    @Prop({ required: true })
    modifiedImagePath: string;

    @ApiProperty()
    @Prop({ required: false })
    topPlayer: string;

    @ApiProperty()
    id?: string;
}

export const sheetSchema = SchemaFactory.createForClass(Sheet);
