import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SheetDocument = Sheet & Document;

@Schema({ collection: 'gameSheets' })
export class Sheet {
    @Prop()
    sheetId: string;

    @Prop()
    name: string;

    @Prop()
    bestScore: string;

    @Prop()
    difficulty: string;

    @Prop()
    topPlayer: string;
}

export const SheetSchema = SchemaFactory.createForClass(Sheet);
