import { Sheet } from '@common/sheet';

export interface ChatGatewayPayload {
    playerName: string;
    roomName: string;
    message: string;
    sheet?: Sheet;
}
