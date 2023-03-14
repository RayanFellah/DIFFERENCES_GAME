import { Sheet, SheetDocument } from '@app/model/database/sheet';
import { CreateSheetDto } from '@app/model/dto/sheet/create-sheet.dto';
import { UpdateSheetDto } from '@app/model/dto/sheet/update-sheet.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class SheetService {
    constructor(@InjectModel(Sheet.name) public sheetModel: Model<SheetDocument>) {}

    async getAllSheets(): Promise<Sheet[]> {
        return await this.sheetModel.find({});
    }

    async getSheet(id: string): Promise<Sheet> {
        const sheet = await this.sheetModel.findOne({ _id: id });
        return sheet;
    }

    async addSheet(sheet: CreateSheetDto): Promise<Sheet> {
        try {
            await this.sheetModel.create(sheet);
        } catch (error) {
            return Promise.reject(`Failed to insert sheet: ${error}`);
        }
    }

    async deleteSheet(id: string): Promise<void> {
        try {
            const res = await this.sheetModel.deleteOne({
                id,
            });
            if (res.deletedCount === 0) {
                return Promise.reject('Could not find course');
            }
        } catch (error) {
            return Promise.reject(`Failed to delete sheet: ${error}`);
        }
    }

    async modifySheet(sheet: UpdateSheetDto): Promise<void> {
        const filterQuery = { _id: sheet._id };
        try {
            const res = await this.sheetModel.updateOne(filterQuery, sheet);
            if (res.matchedCount === 0) {
                return Promise.reject('Could not find course');
            }
        } catch (error) {
            return Promise.reject(`Failed to update document: ${error}`);
        }
    }

    async isSheetJoinable(id: string) {
        const sheet = await this.sheetModel.findOne({ _id: id });
        return sheet.isJoinable;
    }
}
