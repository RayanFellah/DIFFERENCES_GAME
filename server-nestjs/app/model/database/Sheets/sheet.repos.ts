import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Sheet, SheetDocument } from './schemas/Sheet';

Injectable();
export class SheetsRepository {
    constructor(@InjectModel(Sheet.name) private sheetModel: Model<SheetDocument>) {}

    async findOne(sheetFilterQuery: FilterQuery<Sheet>): Promise<Sheet> {
        return this.sheetModel.findOne(sheetFilterQuery);
    }

    async findMany(sheetsFilterQuery: FilterQuery<Sheet>): Promise<Sheet[]> {
        return this.sheetModel.find(sheetsFilterQuery);
    }

    async createOne(sheet: Sheet): Promise<Sheet> {
        const newSheet = new this.sheetModel(sheet);
        return newSheet.save();
    }

    async findOneAndUpdate(sheetFilterQuery: FilterQuery<Sheet>, sheet: Partial<Sheet>): Promise<Sheet> {
        return this.sheetModel.findOneAndUpdate(sheetFilterQuery, sheet);
    }

    async deleteAllSheets(): Promise<void> {
        await this.sheetModel.deleteMany();
    }
}
