import { ID_LENGTH } from '@app/constants';
import { Sheet } from '@app/model/database/sheet';
import { GameLogicService } from '@app/services/game-logic/game-logic.service';
import { SheetService } from '@app/services/sheet/sheet.service';
import { Coord } from '@common/coord';
import { GameEvents, WAITING_ROOM } from '@common/game-events';
import { LimitedTimeRoom } from '@common/limited-time-room';
import { WaitingRoom } from '@common/waiting-room';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatEvents } from '../chat/chat.gateway.events';
import { DELAY_BEFORE_EMITTING_TIME, PRIVATE_ROOM_ID } from './chat.gateway.constants';
@WebSocketGateway({ cors: true })
@Injectable()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() server: Server;

    rooms: LimitedTimeRoom[] = [];
    waitingRooms: WaitingRoom[] = [];
    availableSheets: Sheet[];
    private readonly room = PRIVATE_ROOM_ID;
    constructor(readonly logger: Logger, readonly sheetService: SheetService, public gameService: GameLogicService) {
        this.sheetService.getAllSheets().then((sheets) => {
            this.availableSheets = sheets;
        });
    }

    @SubscribeMessage(GameEvents.CreateLimitedTimeSolo)
    async createLimitedSoloGame(client: Socket, payload) {
        const room: LimitedTimeRoom = {
            roomName: this.generateRandomId(ID_LENGTH),
            player1: payload.player,
            player2: undefined,
            currentSheet: payload.sheet,
            timeLimit: payload.timeLimit,
            timeBonus: payload.timeBonus,
            hintsLeft: payload.hintsLeft,
            isGameDone: false,
            currentDifferences: [],
            usedSheets: [payload.sheet._id],
        };
        this.rooms.push(room);
        client.join(room.roomName);
        this.server.to(room.roomName).emit(GameEvents.LimitedTimeRoomCreated, room);
    }
    @SubscribeMessage(GameEvents.CreateLimitedTimeCoop)
    createLimitedCoopGame(client: Socket, payload) {
        const waitingRoom: WaitingRoom = {
            sheetId: payload.sheet._id,
            players: [payload.player],
        };

        client.join(WAITING_ROOM + waitingRoom.sheetId);
        this.waitingRooms.push(waitingRoom);
        this.server.to(WAITING_ROOM + waitingRoom.sheetId).emit(GameEvents.WaitingRoomCreated, waitingRoom);
    }

    @SubscribeMessage(GameEvents.JoinCoop)
    joinAndConfirmCoopGame(client: Socket, payload) {
        const waitingRoom = this.waitingRooms.find((iter) => iter.sheetId === payload.sheetId && iter.players.length === 1);
        if (waitingRoom) {
            waitingRoom.players.push(payload.player);
            client.join(WAITING_ROOM + waitingRoom.sheetId);
            this.server.to(WAITING_ROOM + waitingRoom.sheetId).emit(GameEvents.CoopGameConfirmed, waitingRoom);
        }
    }
    @SubscribeMessage(GameEvents.Click)
    handleClick(client: Socket, payload) {
        const click: Coord = { posX: payload.x, posY: payload.y };
        const room: LimitedTimeRoom = this.rooms.find((iter) => iter.roomName === payload.roomName);
        const player = room.player1?.socketId === client.id ? room.player1 : room.player2;
        let diffFound: Coord[] = null;
        for (const diff of room.currentDifferences) {
            if (diff.coords.find((coord) => JSON.stringify(coord) === JSON.stringify(click))) {
                diff.found = true;
                player.differencesFound++;
                diffFound = diff.coords;
                break;
            }
        }
        this.rerollSheet(room);
        this.server.to(room.roomName).emit(GameEvents.ClickValidated, { diffFound, room, player });
    }

    handleConnection(socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
    }

    handleDisconnect(socket: Socket) {
        this.logger.log(`Client disconnected: ${socket.id}`);
    }
    afterInit() {
        setInterval(() => {
            this.emitTime();
        }, DELAY_BEFORE_EMITTING_TIME);
    }
    private emitTime() {
        this.server.emit(ChatEvents.Clock, new Date());
    }

    private generateRandomId(length: number): string {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;

        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    private rerollSheet(room: LimitedTimeRoom) {
        let randomIndex = Math.floor(Math.random() * this.availableSheets.length);
        while (room.usedSheets.includes(this.availableSheets[randomIndex]._id)) {
            randomIndex = Math.floor(Math.random() * this.availableSheets.length);
        }
        room.currentSheet = this.availableSheets[randomIndex];
    }
}
