import { Coord } from './Coord';
export interface GameSheet {
    sheetId: string;
    originalImagePath: string;
    modifiedImagePath: string;
    difficulty: string;
    radius: number;
    differences: Coord[][];
}
