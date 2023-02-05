import { Coord } from '@app/interfaces/Coord';
export interface GameDto {
    imagePath1: string;
    imagePath2: string;
    difficulty: string;
    differences: Coord[][];
}
