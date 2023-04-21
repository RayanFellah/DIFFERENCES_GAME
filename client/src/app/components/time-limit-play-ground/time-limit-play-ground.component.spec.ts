import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementRef } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { HintsService } from '@app/services/hints.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { TimeLimitModeService } from '@app/services/time-limit-mode.service';
import { TimerReplayService } from '@app/services/timer-replay/timer-replay.service';
import { TimeLimitPlayGroundComponent } from './time-limit-play-ground.component';

describe('TimeLimitPlayGroundComponent', () => {
    let component: TimeLimitPlayGroundComponent;
    let fixture: ComponentFixture<TimeLimitPlayGroundComponent>;
    const gameLogic = jasmine.createSpyObj('TimeLimitModeService', [
        'setCanvas',
        'updateImagesInformation',
        'sendClick',
        'bindCanvasRefs',
        'drawOnCanvas',
    ]);
    const socketService = jasmine.createSpyObj('SocketClientService', ['send', 'disconnect', 'isSocketAlive']);
    const hintService: HintsService = jasmine.createSpyObj('HintsService', ['executeHint']);
    const timer = jasmine.createSpyObj('TimerReplayService', ['addPenaltyTime']);
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TimeLimitPlayGroundComponent],
            providers: [
                { provide: TimeLimitModeService, useValue: gameLogic },
                { provide: SocketClientService, useValue: socketService },
                { provide: HintsService, useValue: hintService },
                {
                    provide: TimerReplayService,
                    useValue: timer,
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(TimeLimitPlayGroundComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call bindCanvasRefs', () => {
        const canvas1 = document.createElement('canvas');
        const canvas2 = document.createElement('canvas');
        component['canvas1'] = { nativeElement: canvas1 } as unknown as ElementRef<HTMLCanvasElement>;
        component['canvas2'] = { nativeElement: canvas2 } as unknown as ElementRef<HTMLCanvasElement>;
        component.ngAfterViewInit();
        expect(gameLogic.bindCanvasRefs).toHaveBeenCalledWith(canvas1, canvas2);
    });

    it('should call executeHint', () => {
        const sec = 1000;
        const playAreaContainer = document.createElement('div');
        const differences: Vec2[][] = [[{ posX: 0, posY: 0 }]];
        component['playAreaContainer'] = { nativeElement: playAreaContainer } as unknown as ElementRef<HTMLDivElement>;
        hintService.differences = differences;
        component.hint();
        expect(hintService.executeHint).toHaveBeenCalledWith(playAreaContainer, sec);
    });
});
