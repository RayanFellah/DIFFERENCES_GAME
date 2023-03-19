import { Sheet } from '@app/model/database/sheet';

export interface ChatGatewayPayload {
    playerName: string;
    roomName: string;
    message: string;
    sheet?: Sheet;
}
