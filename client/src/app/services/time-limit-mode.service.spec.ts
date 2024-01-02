/* eslint-disable max-lines */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AudioService } from '@app/services/audio.service';
import { CanvasFormatterService } from '@app/services/canvas-formatter.service';
import { DialogService } from '@app/services/dialog-service/dialog.service';
import { GameStateService } from '@app/services/game-state/game-state.service';
import { HintsService } from '@app/services/hints.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { TimeLimitModeService } from '@app/services/time-limit-mode.service';
import { TimerReplayService } from '@app/services/timer-replay/timer-replay.service';
describe('TimeLimitModeService', () => {
    let service: TimeLimitModeService;
    let dialogServiceSpy: DialogService;
    let gameStateServiceSpy: GameStateService;
    let canvasFormatterSpy: CanvasFormatterService;
    let audioSpy: AudioService;
    let hintServiceSpy: HintsService;

    const socketServiceSpy = jasmine.createSpyObj('SocketClientService', ['on', 'emit']);
    socketServiceSpy.on.and.returnValue({
        pipe: () => {
            return {
                subscribe: () => {
                    return;
                },
            };
        },
    });

    const stubTimeDone = {
        subscribe: () => {
            return;
        },
    };
    const timerSpy = jasmine.createSpyObj('TimerReplayService', ['timeDone$']);
    timerSpy.timeDone$ = stubTimeDone;

    const router = {
        navigate: () => {
            return;
        },
    };

    beforeEach(() => {
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

        service = TestBed.inject(TimeLimitModeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
