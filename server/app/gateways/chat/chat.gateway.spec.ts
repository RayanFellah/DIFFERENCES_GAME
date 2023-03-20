/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SOLO_MODE } from '@app/constants';
import { DifferenceService } from '@app/services/difference/difference.service';
import { GameLogicService } from '@app/services/game-logic/game-logic.service';
import { SheetService } from '@app/services/sheet/sheet.service';
import { Coord } from '@common/coord';
import { Sheet } from '@common/sheet';
import { Logger, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Server, Socket } from 'socket.io';
import { ChatGateway } from './chat.gateway';
import { ChatEvents } from './chat.gateway.events';
describe('ChatGateway', () => {
    let gateway: ChatGateway;
    let logger: SinonStubbedInstance<Logger>;
    let sheetService: SinonStubbedInstance<SheetService>;
    let gameService: SinonStubbedInstance<GameLogicService>;
    const socket = {
        id: 'testSocketId',
        join: jest.fn(),
        emit: jest.fn(),
        broadcast: {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
        },
        leave: jest.fn(),
    } as unknown as Socket;

    const mockServer = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
    } as unknown as Server;
    beforeEach(async () => {
        logger = createStubInstance(Logger);
        sheetService = createStubInstance(SheetService);
        gameService = createStubInstance(GameLogicService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatGateway,
                {
                    provide: Logger,
                    useValue: logger,
                },
                {
                    provide: SheetService,
                    useValue: sheetService,
                },
                {
                    provide: GameLogicService,
                    useValue: gameService,
                },
            ],
        }).compile();

        gateway = module.get<ChatGateway>(ChatGateway);
        gateway.server = mockServer;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    // Add tests for each method in the ChatGateway class here.
    // Make sure to test different scenarios and edge cases to increase coverage.

    // Example:
    it('handleConnection() should log the connection', () => {
        gateway.handleConnection(socket);
        expect(logger.log.calledWith(`Connexion par l'utilisateur avec id : ${socket.id}`)).toBeTruthy();
    });

    // Add more tests here...
    describe('createSoloRoom', () => {
        it('should create a solo room and emit RoomCreated event', async () => {
            const payload = {
                name: 'John Doe',
                sheetId: 'sheetId123',
                roomName: 'roomName123',
            };

            const mockSheet: Sheet = getFakesheet();

            const mockDifferenceService: DifferenceService = {
                listEdges: [],
                coords: [{ posX: 10, posY: 10 }],
                found: false,
                setCoord(coords: Coord[]) {
                    this.coords = coords;
                },
                findEdges() {
                    for (const coord of this.coords) {
                        if (
                            this.coords.find((res: Coord) => res.posX === coord.posX + 1 && res.posY === coord.posY) &&
                            this.coords.find((res: Coord) => res.posX === coord.posX && res.posY === coord.posY + 1) &&
                            this.coords.find((res: Coord) => res.posX === coord.posX - 1 && res.posY === coord.posY) &&
                            this.coords.find((res: Coord) => res.posX === coord.posX && res.posY === coord.posY - 1)
                        ) {
                            continue;
                        } else {
                            this.listEdges.push(coord);
                        }
                    }
                    return this.listEdges;
                },
            };

            const mockDiffs: DifferenceService[] = [mockDifferenceService];

            jest.spyOn(sheetService, 'getSheet').mockImplementation(async () => Promise.resolve(mockSheet));
            jest.spyOn(gameService, 'getAllDifferences').mockImplementation(async () => Promise.resolve(mockDiffs));

            await gateway.createSoloRoom(socket, payload);

            expect(socket.join).toHaveBeenCalledWith(payload.roomName);

            expect(gateway.rooms.length).toBe(1);
            expect(mockServer.emit).toHaveBeenCalledWith(ChatEvents.RoomCreated, payload.roomName);
        });
    });

    describe('validateClick', () => {
        it('should emit clickFeedBack event with correct data', () => {
            const payload = {
                x: 10,
                y: 10,
                playerName: 'John Doe',
                roomName: 'roomName123',
            };
            const mockDifferenceService: DifferenceService = {
                listEdges: [],
                coords: [{ posX: 10, posY: 10 }],
                found: false,
                setCoord(coords: Coord[]) {
                    this.coords = coords;
                },
                findEdges() {
                    for (const coord of this.coords) {
                        if (
                            this.coords.find((res: Coord) => res.posX === coord.posX + 1 && res.posY === coord.posY) &&
                            this.coords.find((res: Coord) => res.posX === coord.posX && res.posY === coord.posY + 1) &&
                            this.coords.find((res: Coord) => res.posX === coord.posX - 1 && res.posY === coord.posY) &&
                            this.coords.find((res: Coord) => res.posX === coord.posX && res.posY === coord.posY - 1)
                        ) {
                            continue;
                        } else {
                            this.listEdges.push(coord);
                        }
                    }
                    return this.listEdges;
                },
            };
            const player = { name: 'John Doe', socketId: socket.id, differencesFound: 0 };
            const room = {
                roomName: payload.roomName,
                player1: player,
                player2: undefined,
                sheet: getFakesheet(),
                differences: [mockDifferenceService],
                numberOfDifferences: 1,
                gameType: SOLO_MODE,
                isGameDone: false,
            };
            gateway.rooms.push(room);

            gateway.validateClick(socket, payload);

            expect(mockServer.emit).toHaveBeenCalledWith(
                'clickFeedBack',
                expect.objectContaining({
                    coords: [{ posX: 10, posY: 10 }],
                    player,
                    diffsLeft: 0,
                }),
            );
        });

        // Add more test cases as needed
    });

    describe('roomMessage', () => {
        it('should not broadcast roomMessage event if message content is empty', async () => {
            const payload = {
                roomName: 'testRoom',
                message: {
                    content: '',
                },
            };

            await gateway.roomMessage(socket, payload);

            expect(socket.broadcast.to).not.toHaveBeenCalled();
        });
        it('should broadcast roomMessage event if message content is not empty', async () => {
            const payload = {
                roomName: 'testRoom',
                message: {
                    content: 'Test message',
                },
            };

            gateway.roomMessage(socket, payload);

            expect(socket.broadcast.to).toHaveBeenCalled();
            expect(socket.broadcast.emit).toHaveBeenCalled();
        });
    });

    describe('finishGame', () => {
        it('should emit gameFinished event with winning player message', async () => {
            const mockDifferenceService: DifferenceService = {
                listEdges: [],
                coords: [{ posX: 10, posY: 10 }],
                found: false,
                setCoord(coords: Coord[]) {
                    this.coords = coords;
                },
                findEdges() {
                    for (const coord of this.coords) {
                        if (
                            this.coords.find((res: Coord) => res.posX === coord.posX + 1 && res.posY === coord.posY) &&
                            this.coords.find((res: Coord) => res.posX === coord.posX && res.posY === coord.posY + 1) &&
                            this.coords.find((res: Coord) => res.posX === coord.posX - 1 && res.posY === coord.posY) &&
                            this.coords.find((res: Coord) => res.posX === coord.posX && res.posY === coord.posY - 1)
                        ) {
                            continue;
                        } else {
                            this.listEdges.push(coord);
                        }
                    }
                    return this.listEdges;
                },
            };
            const player = { name: 'John Doe', socketId: socket.id, differencesFound: 0 };
            const room = {
                roomName: getRandomString(),
                player1: player,
                player2: undefined,
                sheet: getFakesheet(),
                differences: [mockDifferenceService],
                numberOfDifferences: 1,
                gameType: SOLO_MODE,
                isGameDone: false,
            };
            gateway.rooms.push(room);
            await gateway.finishGame(socket, room.roomName);
            expect(mockServer.to).toHaveBeenCalledWith(room.roomName);
            expect(mockServer.emit).toHaveBeenCalledWith('gameFinished', { content: `${room.player1.name} won !`, type: 'game' });
        });
    });

    describe('joinGridRoom', () => {
        it('should join GridRoom', async () => {
            await gateway.joinGridRoom(socket);
            expect(socket.join).toHaveBeenCalledWith('GridRoom');
        });
    });

    describe('joinableGame', () => {
        it('should set sheet as joinable, join specific room, and emit Joinable event', async () => {
            const sheetId = 'testSheetId';
            await gateway.joinableGame(socket, sheetId);
            expect(socket.join).toHaveBeenCalledWith(`GameRoom${sheetId}`);
            expect(socket.broadcast.to).toHaveBeenCalledWith('GridRoom');
            expect(socket.broadcast.emit).toHaveBeenCalledWith('Joinable', sheetId);
        });
    });

    describe('cancelGameCreation', () => {
        it('should modify the sheet and broadcast a Cancelled event', () => {
            const sheetId = 'testSheetId';
            const socket2 = {
                broadcast: {
                    to: jest.fn().mockReturnThis(),
                    emit: jest.fn(),
                },
            } as unknown as Socket;

            gateway.cancelGameCreation(socket2, sheetId);

            expect(socket2.broadcast.to).toHaveBeenCalledWith('GridRoom');
            expect(socket2.broadcast.emit).toHaveBeenCalledWith('Cancelled', sheetId);
        });
    });
    describe('joinGame', () => {
        it('should join the game room and broadcast UserJoined event', () => {
            const playerName = 'John Doe';
            const sheetId = 'abc123';

            gateway.joinGame(socket, { playerName, sheetId });

            expect(socket.broadcast.to).toHaveBeenCalledWith(`GameRoom${sheetId}`);
            expect(socket.broadcast.emit).toHaveBeenCalledWith('UserJoined', { playerName, sheetId });
        });
    });
    describe('playerConfirmed', () => {
        it('should successfully confirm a player and create a room', async () => {
            const payload = {
                player1: 'Player1',
                player2: 'Player2',
                sheetId: 'validSheetId',
            };

            // Mock sheetService.getSheet and gameService.getAllDifferences to return fake data
            gateway.sheetService.getSheet = jest.fn().mockResolvedValue({
                /* fake sheet data */
            });
            gateway.gameService.getAllDifferences = jest.fn().mockResolvedValue([
                /* fake differences data */
            ]);

            await gateway.playerConfirmed(socket, payload);

            expect(socket.join).toHaveBeenCalled();
            expect(socket.broadcast.to).toHaveBeenCalled();
            expect(gateway.server.to).toHaveBeenCalled();
        });

        it('should handle invalid sheetId', async () => {
            const payload = {
                player1: 'Player1',
                player2: 'Player2',
                sheetId: 'invalidSheetId',
            };

            // Mock sheetService.getSheet to return null for invalid sheetId
            gateway.sheetService.getSheet = jest.fn().mockResolvedValue(null);

            try {
                await gateway.playerConfirmed(socket, payload);
            } catch (error) {
                expect(error).toBeInstanceOf(NotFoundException);
                expect(error.message).toBe('Sheet not found');
            }
        });
    });
    describe('rejectionConfirmed', () => {
        it('should successfully leave the game room', async () => {
            const sheetId = 'validSheetId';

            await gateway.rejectionConfirmed(socket, sheetId);

            expect(socket.leave).toHaveBeenCalled();
        });
    });

    describe('generateRandomId', () => {
        it('should generate a random id with the specified length', () => {
            const idLength = 10;
            const id = gateway['generateRandomId'](idLength);

            expect(id).toHaveLength(idLength);
        });
    });
});
const getFakesheet = (): Sheet | any => ({
    _id: 'sheetId123',
    difficulty: getRandomString(),
    radius: 3,
    originalImagePath: getRandomString(),
    modifiedImagePath: getRandomString(),
    topPlayer: getRandomString(),
    topScore: 0,
    differences: 5,
    isJoinable: true,
    title: getRandomString(),
});

const BASE_36 = 36;
const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);
