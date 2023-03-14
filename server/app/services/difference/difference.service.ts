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

    findEdges() {
        for (const coord of this.coords) {
            if (
                this.coords.find((res: Coord) => res.posX === coord.posX + 1 && res.posY === coord.posY) &&
                this.coords.find((res: Coord) => res.posX === coord.posX && res.posY === coord.posY + 1) &&
                this.coords.find((res: Coord) => res.posX === coord.posX - 1 && res.posY === coord.posY) &&
                this.coords.find((res: Coord) => res.posX === coord.posX && res.posY === coord.posY - 1)
            ) {
                continue;
            } else {
                this.listEdges.push(coord);
            }
        }
        return this.listEdges;
    }
}
