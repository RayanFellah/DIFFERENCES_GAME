import { Coord } from '@app/interfaces/Coord';
import { Injectable } from '@nestjs/common';
import { Difference } from '../difference/difference.service';

Injectable();
export class MouseHandlerService {
    _differences: Difference[];

    set differences(difference: Difference[]) {
        this._differences = difference;
    }
    constructor() {}
    /**
     * Checks if the coordinates of teh click are within the difference
     * @param click coordinates
     * @returns boolean
     */

    onMouseClick(click: Coord) {
        for (let diff of this._differences) {
            if (this.inDifference(click, diff)) {
                return diff;
            }
        }
        return undefined;
    }
    inDifference(click: Coord, diff: Difference): boolean {
        if (diff.coords.find((res) => res.posX == click.posX && res.posY == click.posY)) {
            console.log('User has found the difference');
            return true;
        } else {
            console.log('User has not found the difference');
            return false;
        }
    }
}
