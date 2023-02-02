import { Coord } from '@app/interfaces/Coord';
import { Injectable } from '@nestjs/common';
@Injectable()
export class Difference {
    listEdges: Array<Coord> = [];
    coords: Array<Coord> = [];

    constructor(coords: Array<Coord>) {
        this.coords = coords;
    }
    findEdges() {
        for (let coord of this.coords) {
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
