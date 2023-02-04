import { Injectable } from '@nestjs/common/decorators';
import { UpdateSheetDto } from './dto/update-sheet.dto';
import { Sheet } from './schemas/Sheet';
import { SheetsRepository } from './sheet.repos';

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
            sheetId: generateRandomId(10),
            name,
            bestScore: '',
            difficulty,
            topPlayer: '',
        });
    }

    async updateSheet(sheetId: string, sheetUpdates: UpdateSheetDto): Promise<Sheet> {
        return this.sheetRepository.findOneAndUpdate({ sheetId }, sheetUpdates);
    }
}

function generateRandomId(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
