import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/interfaces/vec2';
import { Sheet } from '@common/sheet';
import { of } from 'rxjs';
import { CanvasHelperService } from './canvas-helper.service';
import { CheatModeService } from './cheat-mode.service';
import { GameHttpService } from './game-http.service';
describe('CheatModeService', () => {
    let service: CheatModeService;
    let gameHttpServiceSpy: jasmine.SpyObj<GameHttpService>;
    let canvasHelperServiceSpy: jasmine.SpyObj<CanvasHelperService>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('GameHttpService', ['getAllDifferences']);
        const spy2 = jasmine.createSpyObj('CanvasHelperService', ['getContext', 'fillStyle', 'getImageData', 'fillRect']);

        TestBed.configureTestingModule({
            providers: [CheatModeService, { provide: GameHttpService, useValue: spy }, { provide: CanvasHelperService, useValue: spy2 }],
        });
        service = TestBed.inject(CheatModeService);
        gameHttpServiceSpy = TestBed.inject(GameHttpService) as jasmine.SpyObj<GameHttpService>;
        canvasHelperServiceSpy = TestBed.inject(CanvasHelperService) as jasmine.SpyObj<CanvasHelperService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getDifferences', () => {
        it('should fetch the differences and set them to the property', () => {
            const fakeSheet: Partial<Sheet> = { _id: '123' } as Sheet;
            const fakeDifferences: Vec2[][] = [[{ posX: 1, posY: 2 }]];
            gameHttpServiceSpy.getAllDifferences.and.returnValue(of(fakeDifferences));

            service.getDifferences(fakeSheet as Sheet);

            expect(gameHttpServiceSpy.getAllDifferences).toHaveBeenCalledWith('123');
            expect(service.differences).toEqual(fakeDifferences);
        });
    });

    describe('setColor', () => {
        it('should set fill style of context with the given color', () => {
            canvasHelperServiceSpy.context = jasmine.createSpyObj('CanvasRenderingContext2D', ['fillStyle']);
            const fakeColor: Uint8ClampedArray = new Uint8ClampedArray([255, 0, 0, 255]);

            service.setColor(fakeColor, canvasHelperServiceSpy, 0);

            expect(canvasHelperServiceSpy.context?.fillStyle).toBe('rgba(255,0,0,255)');
        });
    });
    it('should activate cheat mode when called', () => {
        service.cheatModeActivated = false;
        service.cheatBlink(canvasHelperServiceSpy, canvasHelperServiceSpy, canvasHelperServiceSpy.getColor(), canvasHelperServiceSpy.getColor());

        expect(service.cheatModeActivated).toBe(true);
        expect(setInterval).toHaveBeenCalled();
        expect(clearInterval).not.toHaveBeenCalled();
    });

    it('should deactivate cheat mode when called a second time', () => {
        service.cheatModeActivated = true;
        service.cheatBlink(canvasHelperServiceSpy, canvasHelperServiceSpy, canvasHelperServiceSpy.getColor(), canvasHelperServiceSpy.getColor());

        expect(service.cheatModeActivated).toBe(false);
        // expect(clearInterval).toHaveBeenCalledWith(intervalId);
    });

    it('should toggle the color of each pixel in the differences array', () => {
        const differences = [
            { posX: 0, posY: 0 },
            { posX: 1, posY: 1 },
        ];
        service.differences = [differences];
        spyOn(canvasHelperServiceSpy, 'setColor' as never);

        service.cheatModeActivated = true;
        service.cheatBlink(canvasHelperServiceSpy, canvasHelperServiceSpy, canvasHelperServiceSpy.getColor(), canvasHelperServiceSpy.getColor());

        expect(service.setColor).toHaveBeenCalledTimes(differences.length * 4);
        expect(canvasHelperServiceSpy.context?.fillRect).toHaveBeenCalledTimes(differences.length);
        expect(canvasHelperServiceSpy.context?.fillRect).toHaveBeenCalledTimes(differences.length);
    });

    it('should stop cheating when cheat mode is deactivated', () => {
        const spyStopCheating = spyOn(service, 'stopCheating');

        service.cheatModeActivated = true;
        service.cheatBlink(canvasHelperServiceSpy, canvasHelperServiceSpy, canvasHelperServiceSpy.getColor(), canvasHelperServiceSpy.getColor());
        service.cheatModeActivated = false;
        expect(spyStopCheating).toHaveBeenCalledWith(
            canvasHelperServiceSpy,
            canvasHelperServiceSpy,
            canvasHelperServiceSpy.getColor(),
            canvasHelperServiceSpy.getColor(),
        );
    });
});
