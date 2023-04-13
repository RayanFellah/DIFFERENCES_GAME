import { Player } from '@common/player';
import { Sheet } from '@common/sheet';
import { DifferenceService } from '../server/app/services/difference/difference.service';

export interface LimitedTimeRoom {
    roomName: string;
    player1: Player;
    player2: Player;
    currentSheet: Sheet;
    usedSheets: string[];
    timeLimit: number;
    timeBonus: number;
    hintsLeft: number;
    isGameDone: boolean;
    currentDifferences: DifferenceService[];
}
