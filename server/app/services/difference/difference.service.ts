import { Coord } from '@common/coord';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DifferenceService {
    listEdges: Coord[] = [];
    coords: Coord[] = [];
    found: boolean = false;

    setCoord(coords: Coord[]) {
        this.coords = coords;
    }
}
