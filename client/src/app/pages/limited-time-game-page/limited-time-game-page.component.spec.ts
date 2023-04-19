/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';

import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameEvents } from '@common/game-events';
import { LimitedTimeRoom } from '@common/limited-time-room';
import { Player } from '@common/player';
import { Socket } from 'socket.io-client';
import { AudioService } from './audio.service';
import { CanvasFormatterService } from './canvas-formatter.service';
import { DialogService } from './dialog-service/dialog.service';
import { GameStateService } from './game-state/game-state.service';
import { SocketClientService } from './socket-client/socket-client.service';
import { TimeLimitModeService } from './time-limit-mode.service';
// I want a 100% coverage on TimeLimitModeService
describe('TimeLimitModeService', () => {
    let service: TimeLimitModeService;
    let socketServiceSpy: SocketClientService;
    let dialogServiceSpy: DialogService;
    let gameStateServiceSpy: GameStateService;
    let canvasFormatterSpy: CanvasFormatterService;
    let audioSpy: AudioService;
    const router = {
        navigate: () => {
            return;
        },
    };
    const playRoomStub = {
        roomName: 'room',
    } as LimitedTimeRoom;

    const playerStub = {
        socketId: '123',
        name: 'test',
    } as Player;
    const socketStub = {
        connect: () => {
            return;
        },
        disconnect: () => {
            return;
        },
        on: () => {
            return;
        },
        emit: () => {
            return;
        },
        id: '123',
    };

    const canvasStub = {
        getContext: () => {
            return {} as CanvasRenderingContext2D;
        },
    } as unknown as HTMLCanvasElement;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketClientService', ['connect', 'disconnect', 'on', 'send']);
        dialogServiceSpy = jasmine.createSpyObj('DialogService', ['openDialog']);
        gameStateServiceSpy = jasmine.createSpyObj('GameStateService', ['reset']);
        canvasFormatterSpy = jasmine.createSpyObj('CanvasFormatterService', ['reset', 'drawImageOnCanvas']);
        audioSpy = jasmine.createSpyObj('AudioService', ['reset']);
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            providers: [
                TimeLimitModeService,
                { provide: SocketClientService, useValue: socketServiceSpy },
                { provide: DialogService, useValue: dialogServiceSpy },
                { provide: GameStateService, useValue: gameStateServiceSpy },
                { provide: CanvasFormatterService, useValue: canvasFormatterSpy },
                { provide: AudioService, useValue: audioSpy },
                { provide: Router, useValue: router },
            ],
        });

        service = TestBed.inject(TimeLimitModeService);
        socketServiceSpy = TestBed.inject(SocketClientService);
        dialogServiceSpy = TestBed.inject(DialogService);
        gameStateServiceSpy = TestBed.inject(GameStateService);
        canvasFormatterSpy = TestBed.inject(CanvasFormatterService);
        audioSpy = TestBed.inject(AudioService);

        socketServiceSpy.socket = socketStub as unknown as Socket;
        service.playRoom = playRoomStub;
        service.player = playerStub;
        service.leftCanvasRef = canvasStub;
        service.rightCanvasRef = canvasStub;
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('logPlayer should call socketService.connect', () => {
        service.logPlayer('test');
        expect(socketServiceSpy.connect).toHaveBeenCalled();
    });

    it('logPlayer should set isGameInitialized to true', () => {
        service.logPlayer('test');
        expect(gameStateServiceSpy.isGameInitialized).toBeTruthy();
    });

    it('logPlayer should set player', () => {
        service.logPlayer('test');
        expect(service.player.name).toEqual('test');
    });
    // now I want to test the rest of the code

    it('should call socketService.disconnect', () => {
        service.disconnect();
        expect(socketServiceSpy.disconnect).toHaveBeenCalled();
    });

    it('setConstants should set constants', () => {
        const constants = {
            timeLimit: 10,
            timeBonus: 10,
        };
        service.setConstants(constants.timeLimit, constants.timeBonus);
        expect(service.timeBonus).toEqual(constants.timeBonus);
        expect(service.timeLimit).toEqual(constants.timeLimit);
    });

    it('useHint should decrement hints', () => {
        service.hintsLeft = 1;
        const returnValue = service.useHint();
        expect(service.hintsLeft).toEqual(0);
        expect(returnValue).toEqual(true);
    });

    it('use hints should not decrement hints if hintsLeft is 0', () => {
        service.hintsLeft = 0;
        const returnValue = service.useHint();
        expect(service.hintsLeft).toEqual(0);
        expect(returnValue).toEqual(false);
    });

    it('sendClick should send click', () => {
        const event = {
            offsetX: 10,
            offsetY: 10,
        } as MouseEvent;
        const data = {
            playerName: service.player.name,
            x: event.offsetX,
            y: event.offsetY,
            roomName: service.playRoom.roomName,
        };
        service.sendClick(event);
        expect(socketServiceSpy.send).toHaveBeenCalledWith(GameEvents.ClickTL, data);
    });

    it('sendClick should not send click if clickIgnored is true', () => {
        const event = {
            offsetX: 10,
            offsetY: 10,
        } as MouseEvent;
        service.clickIgnored = true;
        service.sendClick(event);
        expect(socketServiceSpy.send).not.toHaveBeenCalled();
    });

    it('sendClick should not send click if isGameOver is true', () => {
        const event = {
            offsetX: 10,
            offsetY: 10,
        } as MouseEvent;
        service.isGameOver = true;
        service.sendClick(event);
        expect(socketServiceSpy.send).not.toHaveBeenCalled();
    });

    it('createGame should send create game event', () => {
        const data = {
            player: service.player,
            timeBonus: service.timeBonus,
            timeLimit: service.timeLimit,
            hintsLeft: service.hintsLeft,
        };
        const event = '';
        service['createGame'](event);
        expect(socketServiceSpy.send).toHaveBeenCalledWith(event, data);
    });

    it('drawCanvas should call canvasFormatter.drawCanvas', () => {
        service.leftBuffer = new Uint8Array(1) as Buffer;
        service.rightBuffer = new Uint8Array(1) as Buffer;
        service['drawOnCanvas']();
        expect(canvasFormatterSpy.drawImageOnCanvas).toHaveBeenCalledTimes(2);
        expect(canvasFormatterSpy.drawImageOnCanvas).toHaveBeenCalledWith(
            new Blob([service.leftBuffer]),
            new Image(),
            service.leftCanvasRef.getContext('2d') as CanvasRenderingContext2D,
        );
    });

    it('updateTimer should decrement timer', () => {
        const result = 9;
        service.timeLimit = 10;
        service['updateTimer']();
        expect(service.timeLimit).toEqual(result);
    });

    it('updateTimer should set isGameOver to true if timer is 0', () => {
        service.timeLimit = 0;
        service['updateTimer']();
        expect(service.isGameOver).toEqual(true);
    });

    it('updateTimer should not decrement timer if timeLimit is 0', () => {
        service.timeLimit = 0;
        service['updateTimer']();
        expect(service.timeLimit).toEqual(0);
    });

    // startTimer() {
    //     this.socketService.on(GameEvents.Clock, () => {
    //         if (!this.isGameOver) this.updateTimer();
    //     });
    // }
    it('startTimer should call socketService.on', () => {
        service.startTimer();
        expect(socketServiceSpy.on).toHaveBeenCalled();
    });
});
