import { Injectable } from '@nestjs/common';
import { HistorySheetDto } from '@app/model/dto/sheet/history-sheet.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { History, HistoryDocument } from '@app/model/database/history';

@Injectable()
export class GameHistoryService {
    constructor(@InjectModel(History.name) public historyModel: Model<HistoryDocument>) {}

    async getHistory(): Promise<History[]> {
        return await this.historyModel.find({});
    }

    async deleteAllHistory(): Promise<void> {
        try {
            const res = await this.historyModel.deleteMany({});

            if (res.deletedCount === 0) {
                return Promise.reject('Could not find games history');
            }
        } catch (error) {
            return Promise.reject(`Failed to delete games History: ${error}`);
        }
    }

    async addHistory(history: HistorySheetDto): Promise<History> {
        try {
            await this.historyModel.create(history);
        } catch (error) {
            return Promise.reject(`Failed to insert sheet: ${error}`);
        }
    }
}
