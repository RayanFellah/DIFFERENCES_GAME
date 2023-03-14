import { DifferenceService } from '../server/app/services/difference/difference.service';
import { Sheet } from './sheet';

export interface PlayRoom {
    roomName: string;
    player1: { socketId: string; name: string; differencesFound: number };
    player2: { socketId: string; name: string; differencesFound: number };
    sheet: Sheet;
    differences: DifferenceService[];
    numberOfDifferences: number;
}
