/* eslint-disable max-lines */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';

import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Vec2 } from '@app/interfaces/vec2';
import { AudioService } from '@app/services/audio.service';
import { CanvasFormatterService } from '@app/services/canvas-formatter.service';
import { DialogService } from '@app/services/dialog-service/dialog.service';
import { GameStateService } from '@app/services/game-state/game-state.service';
import { HintsService } from '@app/services/hints.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { TimeLimitModeService } from '@app/services/time-limit-mode.service';
import { TimerReplayService } from '@app/services/timer-replay/timer-replay.service';
import { LimitedTimeRoom } from '@common/limited-time-room';
import { Player } from '@common/player';
import { Observable } from 'rxjs';
// import { Subscription } from 'rxjs';
import { Socket } from 'socket.io-client';
// I want a 100% coverage on TimeLimitModeService
describe('TimeLimitModeService', () => {
    let service: TimeLimitModeService;
    let socketServiceSpy: SocketClientService;
    let dialogServiceSpy: DialogService;
    let gameStateServiceSpy: GameStateService;
    let canvasFormatterSpy: CanvasFormatterService;
    let audioSpy: AudioService;
    let hintServiceSpy: HintsService;
    let timerSpy: TimerReplayService;
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

    // const timeDone$Stub = {
    //     subscribe: () => {
    //         return;
    //     },
    // } as unknown as BehaviorSubject<boolean>;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketClientService', ['connect', 'disconnect', 'on', 'send', 'isSocketAlive']);
        dialogServiceSpy = jasmine.createSpyObj('DialogService', ['openDialog']);
        gameStateServiceSpy = jasmine.createSpyObj('GameStateService', ['reset']);
        canvasFormatterSpy = jasmine.createSpyObj('CanvasFormatterService', ['reset', 'drawImageOnCanvas', 'displayErrorMessage']);
        audioSpy = jasmine.createSpyObj('AudioService', ['reset', 'playFailSound', 'playSuccessSound']);
        hintServiceSpy = jasmine.createSpyObj('HintsService', ['reset', 'fetchCoords']);
        timerSpy = jasmine.createSpyObj('TimerReplayService', ['reset', 'addTimerBonus']);
        const subscriptionStub = {
            unsubscribe: () => {
                return;
            },
            subscribe: () => {
                return;
            },
        } as unknown as Observable<boolean>;
        timerSpy.timeDone$ = subscriptionStub;

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
                { provide: HintsService, useValue: hintServiceSpy },
                { provide: TimerReplayService, useValue: timerSpy },
            ],
        });

        socketServiceSpy.socket = socketStub as unknown as Socket;

        service = TestBed.inject(TimeLimitModeService);
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

    it('sendClick should send click', () => {
        const event = {
            offsetX: 10,
            offsetY: 10,
            target: canvasStub,
        } as unknown as MouseEvent;
        // const data = {
        //     playerName: service.player.name,
        //     x: event.offsetX,
        //     y: event.offsetY,
        //     roomName: service.playRoom.roomName,
        //     click: {
        //         target: (event.target as HTMLCanvasElement).id,
        //         x: event.offsetX,
        //         y: event.offsetY,
        //     },
        // };
        service.sendClick(event);
        expect(service.currentClick).toEqual(event);
        expect(socketServiceSpy.send).toHaveBeenCalled();
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
    it('updateTimer should not decrement timer if timeLimit is 0', () => {
        service.timeLimit = 0;
        service['updateTimer']();
        expect(service.timeLimit).toEqual(0);
    });

    it('startTimer should call socketService.on', () => {
        service.startTimer();
        expect(socketServiceSpy.on).toHaveBeenCalled();
    });

    it('handleClick should call canvasFormatter.displayErrorMessage', () => {
        const event = {
            offsetX: 10,
            offsetY: 10,
            target: canvasStub,
        } as unknown as MouseEvent;
        const ctx = canvasStub.getContext('2d') as CanvasRenderingContext2D;
        const diff = undefined;
        const player = {
            socketId: '123',
        } as unknown as Player;
        service['handleClick'](event, diff, player.socketId);
        expect(canvasFormatterSpy.displayErrorMessage).toHaveBeenCalledWith(event, ctx);
        expect(service.clickIgnored).toEqual(true);
    });

    it('handleClick should handleClick for a defined array', () => {
        const event = {
            offsetX: 10,
            offsetY: 10,
            target: canvasStub,
        } as unknown as MouseEvent;
        const diff = [
            {
                posX: 1,
                posY: 1,
            },
        ] as Vec2[];
        const player = {
            socketId: '123',
        } as unknown as Player;
        const beforeCall = service.timeLimit;
        service['handleClick'](event, diff, player.socketId);
        expect(timerSpy.addTimerBonus).toHaveBeenCalled();
        expect(service.timeLimit).toEqual(beforeCall + service.timeBonus);
        expect(hintServiceSpy.fetchCoords).toHaveBeenCalled();
        expect(audioSpy.playSuccessSound).toHaveBeenCalled();
        expect(service.differencesFound).toEqual(1);
    });

    it('expect handlers to have been set', () => {
        const numberOfHandlers = 5;
        service['handleResponses']();
        expect(socketServiceSpy.on).toHaveBeenCalledTimes(numberOfHandlers);
    });

    // private ignoreClicks() {
    //     const time = 1000;
    //     this.clickIgnored = true;
    //     setTimeout(() => {
    //         this.clickIgnored = false;
    //     }, time);
    // }

    it('ignoreClicks should set clickIgnored to true', () => {
        service['ignoreClicks']();
        expect(service.clickIgnored).toEqual(true);
    });
});
