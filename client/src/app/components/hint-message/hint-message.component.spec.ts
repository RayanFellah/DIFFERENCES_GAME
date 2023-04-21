import { ChangeDetectorRef, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameEvents } from '@app/interfaces/game-events';
import { GameReplayService } from '@app/services/game-replay/game-replay.service';
import { HintsService } from '@app/services/hints.service';
import { HintMessageComponent } from './hint-message.component';

describe('HintMessageComponent', () => {
    let component: HintMessageComponent;
    let fixture: ComponentFixture<HintMessageComponent>;
    let hintService: HintsService;
    let replayService: GameReplayService;
    let cdRef: ChangeDetectorRef;
    beforeEach(async () => {
        hintService = jasmine.createSpyObj('HintsService', ['executeThirdHint']);
        replayService = jasmine.createSpyObj('GameReplayService', ['isLastHint']);
        cdRef = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
        // const difference: Vec2[] = [{ posX: 5, posY: 5 }];
        const gameEvent = {
            type: 'chat',
            timestamp: 3,
            data: [{ posX: 5, posY: 5 }],
        } as unknown as GameEvents;
        replayService.events = [];
        replayService.events.push(gameEvent);

        await TestBed.configureTestingModule({
            declarations: [HintMessageComponent],
            providers: [
                { provide: HintsService, useValue: hintService },
                { provide: GameReplayService, useValue: replayService },
                { provide: ChangeDetectorRef, useValue: cdRef },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(HintMessageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('true', () => {
        expect(component).toBeTruthy();
    });
    it('should call executeThirdHint if hintsLeft is 0 and draw is true', () => {
        hintService.hintsLeft = 0;
        component.draw = true;
        const gameEvent = {
            type: 'chat',
            timestamp: 3,
            data: {},
            playerName: 'skander',
        } as unknown as GameEvents;
        replayService.events = [gameEvent];
        component.ngAfterViewChecked();
        expect(hintService.executeThirdHint).toHaveBeenCalled();
    });

    it('should drawDiff if canvas is defined', () => {
        const gameEvent = {
            type: 'chat',
            timestamp: 3,
            data: [{ posX: 5, posY: 5 }],
        } as unknown as GameEvents;
        replayService.events = [];
        replayService.events.push(gameEvent);
        hintService.hintsLeft = 0;
        component.draw = true;
        component.canvas = {
            nativeElement: {
                getContext: () => {
                    return {
                        fillRect: () => {
                            return;
                        },
                    };
                },
            },
        } as unknown as ElementRef<HTMLCanvasElement>;
        const spy = spyOn(component, 'drawDiff').and.callFake(() => {
            return;
        });
        component.ngAfterViewChecked();
        expect(spy).toHaveBeenCalled();
    });

    it('should not drawDiff if canvas is undefined', () => {
        const gameEvent = {
            type: 'chat',
            timestamp: 3,
            data: [{ posX: 5, posY: 5 }],
        } as unknown as GameEvents;
        replayService.events = [];
        replayService.events.push(gameEvent);
        hintService.hintsLeft = 0;
        component.draw = true;
        component.canvas = undefined;
        const spy = spyOn(component, 'drawDiff').and.callFake(() => {
            return;
        });
        component.ngAfterViewChecked();
        expect(spy).not.toHaveBeenCalled();
    });
    it('drawDIff should draw the difference', () => {
        const fakeCtx = {
            fillRect: () => {
                return;
            },
            drawImage: () => {
                return;
            },
        } as unknown as CanvasRenderingContext2D;

        const attr = {
            nativeElement: {
                getContext: () => {
                    return fakeCtx;
                },
            },
        } as unknown as ElementRef<HTMLCanvasElement>;

        component.canvas = attr;
        const spy2 = spyOn(fakeCtx, 'fillRect');
        const spy3 = spyOn(fakeCtx, 'drawImage');
        component.drawDiff([{ posX: 5, posY: 5 }]);

        // expect(spy1).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
        expect(spy3).toHaveBeenCalled();
    });
});
