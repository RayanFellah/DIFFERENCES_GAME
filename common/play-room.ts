import { Player } from '@common/player';
import { DifferenceService } from '../server/app/services/difference/difference.service';
import { Sheet } from './sheet';

export interface PlayRoom {
    roomName: string;
    player1: Player;
    player2: Player;
    sheet: Sheet;
    startTime: Date;
    differences: DifferenceService[];
    numberOfDifferences: number;
    gameType: string;
    isGameDone: boolean;
}
