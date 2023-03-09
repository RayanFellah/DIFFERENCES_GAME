export interface ChatGatewayPayload {
    playerName: string;
    roomName: string;
    message: string;
    sheet?: any;
}