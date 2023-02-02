import { Coord } from './Coord';
export interface GameSheet {
    originalImagePath: string;
    modifiedImagePath: string;
    difficulty: string;
    differences: {
        coords: Coord[];
        edges: Coord[];
    }[];
}
