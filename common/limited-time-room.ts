import { DifferenceService } from '@app/services/difference/difference.service';
import { Player } from '@common/player';
import { Sheet } from '@common/sheet';

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
