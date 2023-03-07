import { Sheet } from './sheet';

export interface PlayRoom {
    roomName: string;
    player1: { socketId: string; name: string };
    player2: { socketId: string; name: string };
    sheet: Sheet;
}
