import { Sheet, SheetDocument } from '@app/model/database/sheet';
import { CreateSheetDto } from '@app/model/dto/sheet/create-sheet.dto';
import { UpdateSheetDto } from '@app/model/dto/sheet/update-sheet.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SheetService {
    addedSheetSubject = new BehaviorSubject<Sheet>(null);
    deletedSheetSubject = new BehaviorSubject<string>(null);
    addedSheet = this.addedSheetSubject.asObservable();
    deletedSheet = this.deletedSheetSubject.asObservable();
    constructor(@InjectModel(Sheet.name) public sheetModel: Model<SheetDocument>) {
        this.watchChanges();
    }

    async getAllSheets(): Promise<Sheet[]> {
        return await this.sheetModel.find({});
    }

    async getSheet(id: string): Promise<Sheet> {
        const sheet = await this.sheetModel.findOne({ _id: id });
        return sheet;
    }

    async addSheet(sheet: CreateSheetDto): Promise<Sheet> {
        try {
            return await this.sheetModel.create(sheet);
        } catch (error) {
            return Promise.reject(`Failed to insert sheet: ${error}`);
        }
    }

    async deleteSheet(_id: string): Promise<void> {
        try {
            const res = await this.sheetModel.deleteOne({
                _id,
            });

            if (res.deletedCount === 0) {
                return Promise.reject('Could not find sheet to delete');
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
                return Promise.reject('Could not find sheet to modify');
            }
        } catch (error) {
            return Promise.reject(`Failed to update document: ${error}`);
        }
    }
    async deleteAllSheets(): Promise<void> {
        try {
            const res = await this.sheetModel.deleteMany({});
            if (res.deletedCount === 0) {
                return Promise.reject('Could not delete sheets');
            }
        } catch (error) {
            return Promise.reject(`Failed to delete sheets: ${error}`);
        }
    }
    watchChanges(): void {
        this.sheetModel.watch().on('change', (change) => {
            let addSheet;
            let deleteSheetID;
            if (change.operationType === 'insert') {
                addSheet = change.fullDocument;
                this.addedSheetSubject.next(addSheet);
            } else if (change.operationType === 'delete') {
                deleteSheetID = change.documentKey._id;
                this.deletedSheetSubject.next(deleteSheetID);
            }
        });
    }
}
