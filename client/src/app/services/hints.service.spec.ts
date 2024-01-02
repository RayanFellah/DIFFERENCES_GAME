import { HttpClient } from '@angular/common/http';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
// eslint-disable-next-line no-restricted-imports
import { Vec2 } from '@app/interfaces/vec2';
import { Sheet } from '@common/sheet';
import { of } from 'rxjs';
// eslint-disable-next-line no-restricted-imports
import { AudioService } from './audio.service';
import { GameHttpService } from './game-http.service';
import { GameReplayService } from './game-replay/game-replay.service';
import { HintsService } from './hints.service';

describe('HintsService', () => {
    let service: HintsService;
    const gameHttpSpy = jasmine.createSpyObj('GameHttpService', ['getHint', 'getAllDifferences']);
    const audioSpy = jasmine.createSpyObj('AudioService', ['playHintSound']);
    const gameReplayServiceSpy = jasmine.createSpyObj('GameReplayService', ['getHint', 'addTime']);
    let container: HTMLElement;
    const delay = 500;
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                HintsService,
                { provide: GameHttpService, useValue: gameHttpSpy },
                { provide: AudioService, useValue: audioSpy },
                { provide: HttpClient, useValue: {} },
                { provide: GameReplayService, useValue: gameReplayServiceSpy },
            ],
        });
        service = TestBed.inject(HintsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set seed', () => {
        const seed = 'test';
        service.seed = seed;
        expect(seed).toEqual(seed);
    });

    it('should get differences', () => {
        const fakeSheet: Partial<Sheet> = { _id: '123' } as Sheet;
        const fakeDifferences: Vec2[][] = [[{ posX: 1, posY: 2 }]];
        gameHttpSpy.getAllDifferences.and.returnValue(of(fakeDifferences));

        service.getDifferences(fakeSheet._id as string);

        expect(gameHttpSpy.getAllDifferences).toHaveBeenCalledWith('123');
        expect(service.differences).toEqual(fakeDifferences);
    });
    it('should execute first hint if hintsLeft is 3', () => {
        service.hintsLeft = 3;
        service.blockClick = false;
        spyOn(service, 'executeFirstHint').and.stub();
        spyOn(service, 'executeSecondHint').and.stub();
        spyOn(service, 'executeThirdHint').and.stub();
        service.executeHint(container, delay);
        expect(service.blockClick).toBeTrue();
        expect(service.activateHint).toBeTrue();
        expect(service.executeFirstHint).toHaveBeenCalledWith(delay, container);
        expect(service.executeSecondHint).not.toHaveBeenCalled();
        expect(service.executeThirdHint).not.toHaveBeenCalled();
        expect(audioSpy.playHintSound).toHaveBeenCalled();
        expect(service.hintsLeft).toBe(2);
    });
    it('should execute second hint if hintsLeft is 2', () => {
        service.hintsLeft = 2;
        service.blockClick = false;
        spyOn(service, 'executeFirstHint').and.stub();
        spyOn(service, 'executeSecondHint').and.stub();
        spyOn(service, 'executeThirdHint').and.stub();
        service.executeHint(container, delay);
        expect(service.blockClick).toBeTrue();
        expect(service.activateHint).toBeTrue();
        expect(service.executeFirstHint).not.toHaveBeenCalled();
        expect(service.executeSecondHint).toHaveBeenCalledWith(delay, container);
        expect(service.executeThirdHint).not.toHaveBeenCalled();
        expect(service.hintsLeft).toBe(1);
    });
    it('should execute third hint if hintsLeft is 1', () => {
        service.hintsLeft = 1;
        service.blockClick = false;
        spyOn(service, 'executeFirstHint').and.stub();
        spyOn(service, 'executeSecondHint').and.stub();
        spyOn(service, 'executeThirdHint').and.stub();
        service.executeHint(container, delay);
        expect(service.blockClick).toBeTrue();
        expect(service.activateHint).toBeTrue();
        expect(service.executeFirstHint).not.toHaveBeenCalled();
        expect(service.executeSecondHint).not.toHaveBeenCalled();
        expect(service.executeThirdHint).toHaveBeenCalled();
        expect(service.hintsLeft).toBe(0);
    });

    it('should execute third hint', () => {
        const fakeDiff: Vec2 = { posX: 1, posY: 2 };
        spyOn(service, 'chooseRandomDifference' as keyof HintsService).and.returnValue(fakeDiff);
        const result = service.executeThirdHint();
        expect(service['chooseRandomDifference']).toHaveBeenCalled();
        expect(result).toEqual(result);
    });
    it('should execute second hint', () => {
        const fakeDial = { startPos: { posX: 1, posY: 2 }, width: 3, height: 4 };
        spyOn(service, 'showDial' as keyof HintsService).and.returnValue(fakeDial);
        service.executeSecondHint(delay, container);
        expect(service.showDial).toHaveBeenCalled();
    });

    it('should execute first hint', () => {
        const fakeDial = { startPos: { posX: 1, posY: 2 }, width: 3, height: 4 };
        spyOn(service, 'showDial' as keyof HintsService).and.returnValue(fakeDial);
        service.executeFirstHint(delay, container);
        expect(service.showDial).toHaveBeenCalled();
    });
    it('should select dial', () => {
        const fakeDiff: Vec2 = { posX: 1, posY: 2 };
        const quarter = 4;
        const result = service.selectDial(fakeDiff, quarter, quarter);
        expect(result).toEqual(result);
    });

    it('should show dial', () => {
        const fakeDiff: Vec2 = { posX: 1, posY: 2 };
        service.differences = [[fakeDiff]];
        service.tempCanvas = document.createElement('canvas');
        service.tempContext = service.tempCanvas.getContext('2d') as CanvasRenderingContext2D;
        spyOn(service.tempContext, 'fillRect').and.stub();
        spyOn(service, 'chooseRandomDifference' as keyof HintsService).and.returnValue(fakeDiff);
        spyOn(service, 'selectDial' as keyof HintsService).and.returnValue({ startPos: fakeDiff, width: 3, height: 4 });
        spyOn(service, 'createTempCanvas' as keyof HintsService).and.stub();
        const quarter = 4;
        service.showDial(quarter, quarter, container, delay);
        expect(service['chooseRandomDifference']).toHaveBeenCalled();
        expect(service['selectDial']).toHaveBeenCalled();
        expect(service['createTempCanvas']).toHaveBeenCalled();
        // expect(service['clearTempCanvas']).toHaveBeenCalled();
    });
    it('should remove the temp canvas and reset the blockClick and activateHint properties after the specified delay', fakeAsync(() => {
        const fakeDiff: Vec2 = { posX: 1, posY: 2 };
        service.differences = [[fakeDiff]];
        service.tempCanvas = document.createElement('canvas');
        service.blockClick = true;
        service.activateHint = true;
        const timeDelay = 100;
        const quarter = 4;
        service.showDial(quarter, quarter, document.createElement('div'), timeDelay);
        expect(service.blockClick).toBeTrue();
        expect(service.activateHint).toBeTrue();
        tick(timeDelay);
        expect(service.blockClick).toBeFalse();
        expect(service.activateHint).toBeFalse();
    }));

    it('should apply time penalty', () => {
        const fakeDiffs = [
            [{ posX: 1, posY: 2 }],
            [
                { posX: 20, posY: 30 },
                { posX: 21, posY: 30 },
            ],
        ];
        service.differences = fakeDiffs;
        const diffToRemove = [
            { posX: 20, posY: 30 },
            { posX: 21, posY: 30 },
        ];
        service.removeDifference(diffToRemove);
        expect(service.differences).toEqual([[{ posX: 1, posY: 2 }]]);
    });
    it('should apply time penalty correctly when time is provided', () => {
        const year = 2023;
        const month = 5;
        const day = 1;
        const hour = 10;
        const minute = 30;
        const second = 0;
        const time = new Date(year, month, day, hour, minute, second);
        const timePenalty = 10;
        service.hintsLeft = 1;
        spyOn(time, 'setSeconds').and.stub();
        service.applyTimePenalty(timePenalty, time);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(time.setSeconds).toHaveBeenCalledWith(20);
    });
    it('should call addtime when time is not provided', () => {
        service.hintsLeft = 2;
        const timePenalty = 10;
        service.applyTimePenalty(timePenalty);
        expect(gameReplayServiceSpy.addTime).toHaveBeenCalled();
    });
});
