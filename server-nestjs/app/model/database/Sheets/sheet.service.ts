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

    async createSheet(name: string, difficulty: string) {
        return this.sheetRepository.createOne({
            sheetId: generateRandomId(),
            name,
            bestScore: '',
            difficulty,
            topPlayer: '',
            originalImagePath: '',
            modifiedImagePath: '',
            radius: 3,
        });
    }

    async updateSheet(sheetId: string, sheetUpdates: Partial<UpdateSheetDto>): Promise<Sheet> {
        return this.sheetRepository.findOneAndUpdate({ sheetId }, sheetUpdates);
    }
}
