/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SOLO_MODE } from '@app/constants';
import { DifferenceService } from '@app/services/difference/difference.service';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { GameLogicService } from '@app/services/game-logic/game-logic.service';
import { SheetService } from '@app/services/sheet/sheet.service';
import { Coord } from '@common/coord';
import { PlayRoom } from '@common/play-room';
import { Sheet } from '@common/sheet';
import { Logger, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import { SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { ChatGateway } from './chat.gateway';
import { ChatEvents } from './chat.gateway.events';
describe('ChatGateway', () => {
    let gateway: ChatGateway;
    let logger: SinonStubbedInstance<Logger>;
    let sheetService: SinonStubbedInstance<SheetService>;
    let gameService: SinonStubbedInstance<GameLogicService>;
    let server: SinonStubbedInstance<Server>;
    let socket: SinonStubbedInstance<Socket>;
    beforeEach(async () => {
        logger = createStubInstance(Logger);
        sheetService = createStubInstance(SheetService);
        gameService = createStubInstance(GameLogicService);
        server = createStubInstance<Server>(Server);
        socket = createStubInstance<Socket>(Socket);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatGateway,
                {
                    provide: SheetService,
                    useValue: sheetService,
                },
                {
                    provide: GameLogicService,
                    useValue: gameService,
                },
                {
                    provide: GameHistoryService,
                    useValue: {
                        addHistory: jest.fn(),
                    },
                },
            ],
        }).compile();

        gateway = module.get<ChatGateway>(ChatGateway);
        gateway.server = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
    describe('Validate click', () => {
        it('should emit foundDiff and click feedback is matching coords', () => {
            const payload = {
                click: { x: 1, y: 2 },
                playerName: 'John Doe',
                roomName: 'roomName123',
            };
            const mockDifferenceService = getMockDifferenceService();
            const player = { name: 'John Doe', socketId: socket.id, differencesFound: 0 };
            const room = {
                roomName: payload.roomName,
                player1: player,
                player2: undefined,
                sheet: getFakeSheet(),
                differences: [mockDifferenceService],
                numberOfDifferences: 5,
                gameType: SOLO_MODE,
                isGameDone: false,
                startTime: new Date(),
            };
            gateway.rooms = [room];

            server.to.returns({
                emit: (event: string) => {
                    expect(event).toBeOneOf([ChatEvents.RoomMessage, 'clickFeedBack', 'foundDiff', 'gameDone']);
                },
            } as BroadcastOperator<unknown, unknown>);

            gateway.validateClick(socket, payload);

            room.numberOfDifferences = 1;
            gateway.validateClick(socket, payload);
        });

        it('should emit click feedback only if coords not matching', () => {
            const payload = {
                click: { x: 1, y: 2 },
                playerName: 'John Doe',
                roomName: 'roomName123',
            };

            const mockDifferenceService = getMockDifferenceService();
            const events: string[] = ['roomMessage', 'clickFeedBack'];
            const player = { name: 'John Doe', socketId: socket.id, differencesFound: 0 };
            const room = {
                roomName: payload.roomName,
                player1: player,
                player2: undefined,
                sheet: getFakeSheet(),
                differences: [mockDifferenceService],
                numberOfDifferences: 5,
                gameType: SOLO_MODE,
                isGameDone: false,
                startTime: new Date(),
            };
            gateway.rooms.push(room);
            server.to.returns({
                emit: (event: string) => {
                    expect(event).toBeOneOf(events);
                },
            } as BroadcastOperator<unknown, unknown>);

            gateway.validateClick(socket, payload);
        });
    });
    describe('Join Game', () => {
        it('should call modifySheet() from sheetService', () => {
            const sheetId = getRandomString();

            const emitSpy = jest.fn();

            Object.defineProperty(socket, 'broadcast', {
                value: {
                    to: jest.fn().mockReturnValue({ emit: emitSpy }),
                },
                writable: true,
                configurable: true,
            });

            gateway.joinableGame(socket, { playerName: 'ahmed', sheetId });

            expect(sheetService.modifySheet.called).toBeTruthy();
            expect(socket.join.called).toBeTruthy();
            expect(socket.broadcast.to).toBeCalledWith('GridRoom');
            expect(emitSpy).toBeCalledWith('Joinable', sheetId);
        });
        it('should call leave if we cancel join game', () => {
            const emitSpy = jest.fn();

            Object.defineProperty(socket, 'broadcast', {
                value: {
                    to: jest.fn().mockReturnValue({ emit: emitSpy }),
                },
                writable: true,
                configurable: true,
            });
            gateway.cancelJoinGame(socket, { playerName: 'ahmed', sheetId: getRandomString() });
            expect(socket.leave.called).toBeTruthy();
        });
    });
    describe('Cancel game creation', () => {
        it('should call modifySheet', async () => {
            const sheetId = getRandomString();

            const emitSpy = jest.fn();

            Object.defineProperty(socket, 'broadcast', {
                value: {
                    to: jest.fn().mockReturnValue({ emit: emitSpy }),
                },
                writable: true,
                configurable: true,
            });

            gateway.cancelGameCreation(socket, sheetId);

            expect(sheetService.modifySheet.called).toBeTruthy();
            expect(socket.broadcast.to).toBeCalledWith('GridRoom');
        });
    });
    describe('Finish game', () => {
        it('should emit game finished event', async () => {
            const payload = {
                x: 0,
                y: 0,
                playerName: 'John Doe',
                roomName: 'roomName123',
            };

            const mockDifferenceService = getMockDifferenceService();

            const player = { name: 'John Doe', socketId: socket.id, differencesFound: 0 };
            const room = {
                roomName: payload.roomName,
                player1: player,
                player2: undefined,
                sheet: getFakeSheet(),
                differences: [mockDifferenceService],
                numberOfDifferences: 0,
                gameType: SOLO_MODE,
                isGameDone: false,
                startTime: new Date(),
            };
            gateway.rooms.push(room);
            server.to.returns({
                emit: (event: string) => {
                    expect(event).toBe('gameFinished');
                },
            } as BroadcastOperator<unknown, unknown>);
        });
    });
    describe('Room messages', () => {
        it('roomMessage() should send message if socket in the room', () => {
            stub(socket, 'rooms').value(new Set([getRandomString]));
            server.to.returns({
                emit: (event: string) => {
                    expect(event).toEqual(ChatEvents.RoomMessage);
                },
            } as BroadcastOperator<unknown, unknown>);
            const emitSpy = jest.fn();

            Object.defineProperty(socket, 'broadcast', {
                value: {
                    to: jest.fn().mockReturnValue({ emit: emitSpy }),
                },
                writable: true,
                configurable: true,
            });
            gateway.roomMessage(socket, { message: { content: 'X' } });
        });
    });
    describe('Join Game', () => {
        it('Socket should join the room', () => {
            stub(socket, 'rooms').value(new Set([getRandomString]));
            server.to.returns({
                emit: (event: string) => {
                    expect(event).toEqual(ChatEvents.RoomMessage);
                },
            } as BroadcastOperator<unknown, unknown>);
            const emitSpy = jest.fn();

            Object.defineProperty(socket, 'broadcast', {
                value: {
                    to: jest.fn().mockReturnValue({ emit: emitSpy }),
                },
                writable: true,
                configurable: true,
            });
            const waitingRoom = { players: ['ahmed'], sheetId: getRandomString() };
            gateway.waitingRooms.push(waitingRoom);
            gateway.joinGame(socket, { playerName: 'joe', sheetId: waitingRoom.sheetId });
            expect(socket.join.called).toBeTruthy();
        });
    });
    describe('playerJoined', () => {
        it('should push a new room to rooms', () => {
            const mockSheet: Sheet = getFakeSheet();
            const mockDifferenceService: DifferenceService = new DifferenceService();
            const mockDiffs: DifferenceService[] = [mockDifferenceService];
            jest.spyOn(sheetService, 'getSheet').mockImplementation(async () => Promise.resolve(mockSheet));
            jest.spyOn(gameService, 'getAllDifferences').mockImplementation(async () => Promise.resolve(mockDiffs));

            server.to.returns({
                emit: (event: string) => {
                    expect(event).toEqual(ChatEvents.RoomCreated);
                },
            } as BroadcastOperator<unknown, unknown>);
            const emitSpy = jest.fn();

            Object.defineProperty(socket, 'broadcast', {
                value: {
                    to: jest.fn().mockReturnValue({ emit: emitSpy }),
                },
                writable: true,
                configurable: true,
            });

            gateway.playerConfirmed(socket, { player1: 'ahmed', player2: 'john', sheetId: mockSheet._id });
        });
        it('should throw error if sheet doesnt exist', async () => {
            jest.spyOn(sheetService, 'getSheet').mockImplementation(async () => Promise.resolve(undefined));
            try {
                await gateway.playerConfirmed(socket, { player1: 'ahmed', player2: 'john', sheetId: 'az16' });
            } catch (error) {
                expect(error).toBeInstanceOf(NotFoundException);
                expect(error.message).toBe('Sheet not found');
            }
        });
    });
    describe('player2Joined', () => {
        it('should join the room', () => {
            const payload = {
                x: 0,
                y: 0,
                playerName: 'John Doe',
                roomName: 'roomName123',
            };

            const mockDifferenceService = getMockDifferenceService();

            const player = { name: 'John Doe', socketId: socket.id, differencesFound: 0 };
            const room = {
                roomName: payload.roomName,
                player1: player,
                player2: undefined,
                sheet: getFakeSheet(),
                differences: [mockDifferenceService],
                numberOfDifferences: 0,
                gameType: SOLO_MODE,
                isGameDone: false,
                startTime: new Date(),
            };
            gateway.rooms.push(room);
            const waitingRoom = { players: ['ahmed'], sheetId: room.sheet._id };
            gateway.waitingRooms.push(waitingRoom);
            server.to.returns({
                emit: (event: string) => {
                    expect(event).toBeOneOf(['numberOfDifferences', 'players', 'test', 'roomInfo']);
                },
            } as BroadcastOperator<unknown, unknown>);

            const emitSpy = jest.fn();
            Object.defineProperty(socket, 'rooms', {
                value: {
                    delete: jest.fn().mockReturnValue({ emit: emitSpy }),
                },
                writable: true,
                configurable: true,
            });
            gateway.player2Joined(socket, { player2: 'ahmed', roomName: room.roomName });
            expect(socket.join.called).toBeTruthy();
        });
    });
    describe('deleteSheet', () => {
        it('should delete the sheet and emit the sheetDeleted event', async () => {
            const mockSheet = getFakeSheet();
            jest.spyOn(sheetService, 'getSheet').mockResolvedValue(mockSheet);
            jest.spyOn(sheetService, 'deleteSheet').mockResolvedValue(undefined);
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});

            server.to.returns({
                emit: (event: string) => {
                    expect(event).toEqual('CurrentGameDeleted');
                },
            } as BroadcastOperator<unknown, unknown>);
            gateway.deleteSheet(socket, { sheetId: mockSheet._id });
        });
    });

    it('should not call socket.leave() or deleteRoom() if no room is found', () => {
        const socket2 = {
            id: 'socket1',
            leave: jest.fn(),
        } as unknown as Socket;
        const deleteRoomMock = jest.fn();
        gateway['deleteRoom'] = deleteRoomMock;
        gateway.rooms = [];
        gateway.handleDisconnect(socket);

        expect(socket2.leave).not.toHaveBeenCalled();
        expect(deleteRoomMock).not.toHaveBeenCalled();
    });

    it('should log user connection', () => {
        const loggerSpy = jest.spyOn(Logger, 'log');

        gateway.handleConnection(socket);

        expect(loggerSpy).toHaveBeenCalledWith(`Connexion par l'utilisateur avec id : ${socket.id}`);
    });

    it('should log user disconnection and handle room events', () => {
        const roomName = 'roomName123';

        const mockDifferenceService = getMockDifferenceService();

        const player = { name: 'John Doe', socketId: socket.id, differencesFound: 0 };
        const room: PlayRoom = {
            roomName,
            player1: player,
            player2: undefined,
            sheet: getFakeSheet(),
            differences: [mockDifferenceService],
            numberOfDifferences: 0,
            gameType: SOLO_MODE,
            isGameDone: false,
            startTime: new Date(),
        };
        gateway.rooms.push(room);
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual('gameDone');
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.handleDisconnect(socket);

        expect(logger.log.called).toBeFalsy();
    });
    it('game Done', () => {
        const mockDelete = jest.fn();
        gateway['deleteSheet'] = mockDelete;
        const roomName = 'roomName123';

        const mockDifferenceService = getMockDifferenceService();

        const player = { name: 'John Doe', socketId: socket.id, differencesFound: 0 };
        const room = {
            roomName,
            player1: player,
            player2: undefined,
            sheet: getFakeSheet(),
            differences: [mockDifferenceService],
            numberOfDifferences: 2,
            gameType: SOLO_MODE,
            isGameDone: true,
            startTime: new Date(),
        };
        gateway.rooms.push(room);
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual('playerLeft');
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.handleDisconnect(socket);
    });
});

const getMockDifferenceService = (): DifferenceService => {
    const mockDifferenceService: DifferenceService = {
        listEdges: [],
        coords: [{ posX: 10, posY: 10 }],
        found: false,
        setCoord(coords: Coord[]) {
            this.coords = coords;
        },
    };
    return mockDifferenceService;
};

const getFakeSheet = (): Sheet => ({
    _id: 'sheetId123',
    difficulty: getRandomString(),
    radius: 3,
    originalImagePath: getRandomString(),
    modifiedImagePath: getRandomString(),
    differences: 5,
    isJoinable: true,
    title: getRandomString(),
    top3Multi: [],
    top3Solo: [],
});

const BASE_36 = 36;
const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);

expect.extend({
    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    toBeOneOf(received: any, items: any[]) {
        const pass = items.includes(received);
        const message = () => `expected ${received} to be contained in array [${items}]`;
        if (pass) {
            return {
                message,
                pass: true,
            };
        }
        return {
            message,
            pass: false,
        };
    },
});

declare global {
    // eslint-disable-next-line no-unused-vars
    namespace jest {
        // eslint-disable-next-line no-unused-vars
        interface Matchers<R> {
            // eslint-disable-next-line no-undef
            toBeOneOf(items: any[]): CustomMatcherResult;
        }
    }
}
