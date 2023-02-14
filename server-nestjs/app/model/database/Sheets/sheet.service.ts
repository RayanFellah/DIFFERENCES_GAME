import { Injectable } from '@nestjs/common/decorators';
import { Sheet } from './schemas/Sheet';
import { SheetsRepository } from './sheet.repos';
@Injectable()
export class SheetService {
    constructor(private readonly sheetRepository: SheetsRepository) {}

    async getSheetById(sheetId: string): Promise<Sheet> {
        const found = await this.sheetRepository.findOne({ sheetId });
        if (found) {
            return found;
        }
        return undefined;
    }

    async getSheets(): Promise<Sheet[]> {
        return this.sheetRepository.findMany({});
    }

    async createSheet(name: string, sheetId: string, originalImagePath: string, modifiedImagePath: string, radius: number) {
        console.log('create sheet');
        console.log(originalImagePath);
        return this.sheetRepository.createOne({
            sheetId,
            name,
            bestScore: '',
            difficulty: '',
            topPlayer: '',
            originalImagePath,
            modifiedImagePath,
            radius,
        });
    }

    async updateSheet(sheetId: string, sheetUpdates: Partial<Sheet>): Promise<Sheet> {
        return this.sheetRepository.findOneAndUpdate({ sheetId }, sheetUpdates);
    }

    async deleteAllSheets() {
        return this.sheetRepository.deleteAllSheets();
    }
}
