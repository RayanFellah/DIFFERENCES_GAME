import { Injectable } from '@nestjs/common/decorators';
import { UpdateSheetDto } from './dto/update-sheet.dto';
import { Sheet } from './schemas/sheet';
import { SheetsRepository } from './sheet.repos';
import { generateRandomId } from '@app/services/randomID/random-id';
@Injectable()
export class SheetService {
    constructor(private readonly sheetRepository: SheetsRepository) {}

    async getSheetById(sheetId: string): Promise<Sheet> {
        return this.sheetRepository.findOne({ sheetId });
    }

    async getSheets(): Promise<Sheet[]> {
        return this.sheetRepository.findMany({});
    }

    async createSheet(nam: string, sheet: string, original: string, modified: string, rad: number) {
        return this.sheetRepository.createOne({
            sheetId: sheet,
            name: nam,
            bestScore: '',
            difficulty: '',
            topPlayer: '',
            originalImagePath: original,
            modifiedImagePath: modified,
            radius: rad,
        });
    }

    async updateSheet(sheetId: string, sheetUpdates: Partial<UpdateSheetDto>): Promise<Sheet> {
        return this.sheetRepository.findOneAndUpdate({ sheetId }, sheetUpdates);
    }
}
