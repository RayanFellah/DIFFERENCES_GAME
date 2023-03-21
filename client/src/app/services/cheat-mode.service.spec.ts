/* eslint-disable @typescript-eslint/no-magic-numbers */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Vec2 } from '@app/interfaces/vec2';
import { Sheet } from '@common/sheet';
import { of } from 'rxjs';
import { CHEAT_BLINK_INTERVAL, HEIGHT, RGBA_LENGTH, WIDTH } from 'src/constants';
import { CanvasHelperService } from './canvas-helper.service';
import { CheatModeService } from './cheat-mode.service';
import { GameHttpService } from './game-http.service';
describe('CheatModeService', () => {
    let service: CheatModeService;
    let gameHttpServiceSpy: jasmine.SpyObj<GameHttpService>;
    let canvasHelperServiceSpy: jasmine.SpyObj<CanvasHelperService>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('GameHttpService', ['getAllDifferences']);
        const spy2 = jasmine.createSpyObj('CanvasHelperService.context', ['getContext', 'fillStyle', 'getImageData', 'fillRect', 'putImageData']);

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
    it('cheatBlink() should stop cheating and clear the interval', fakeAsync(() => {
        const originalImageData = new ImageData(1, 1);
        const modifiedImageData = new ImageData(1, 1);
        service.cheatModeActivated = true;
        const contextSpy = jasmine.createSpyObj('CanvasRenderingContext2D', ['fillRect', 'putImageData', 'getImageData']);
        const setColorSpy = spyOn(service, 'stopCheating');
        canvasHelperServiceSpy.context = contextSpy;
        spyOn(service, 'setColor').and.callThrough();
        service.cheatBlink(canvasHelperServiceSpy, canvasHelperServiceSpy, originalImageData, modifiedImageData);

        service.cheatModeActivated = false;
        tick(CHEAT_BLINK_INTERVAL);
        expect(service.setColor).not.toHaveBeenCalled();
        expect(setColorSpy).toHaveBeenCalledWith(canvasHelperServiceSpy, canvasHelperServiceSpy, originalImageData, modifiedImageData);
        // expect(clearInterval).toHaveBeenCalled();
        expect(canvasHelperServiceSpy.context?.fillRect).not.toHaveBeenCalled();
        expect(canvasHelperServiceSpy.context?.fillRect).not.toHaveBeenCalled();
    }));

    it('should remove difference', () => {
        const diff = [
            { posX: 0, posY: 0 },
            { posX: 1, posY: 1 },
        ];
        service.differences = [];
        service.differences.push(diff);

        service.removeDifference(diff);

        expect(service.differences.length).toEqual(0);
    });
    it('should activate and deactivate cheat mode', () => {
        const canvasMock = document.createElement('canvas');
        canvasHelperServiceSpy.context = canvasMock.getContext('2d');
        const original = new ImageData(WIDTH, HEIGHT);
        const modified = new ImageData(WIDTH, HEIGHT);
        service.cheatBlink(canvasHelperServiceSpy, canvasHelperServiceSpy, original, modified);
        expect(service.cheatModeActivated).toBeTruthy();
        service.color1 = canvasHelperServiceSpy.context?.getImageData(0, 0, WIDTH, HEIGHT) as ImageData;
        service.color2 = canvasHelperServiceSpy.context?.getImageData(0, 0, WIDTH, HEIGHT) as ImageData;
        service.differences = [
            [
                { posX: 0, posY: 0 },
                { posX: 1, posY: 1 },
            ],
            [
                { posX: 2, posY: 2 },
                { posX: 3, posY: 3 },
            ],
        ];
        const expectedColorData = service.color1.data;
        let condition = true;
        for (const difference of service.differences) {
            for (const pixel of difference) {
                const index = (pixel.posX + pixel.posY * WIDTH) * RGBA_LENGTH;
                if (condition) {
                    expectedColorData[index] = 0;
                    expectedColorData[index + 1] = 0;
                    expectedColorData[index + 2] = 0;
                    expectedColorData[index + 3] = 255;
                } else {
                    expectedColorData[index] = 255;
                    expectedColorData[index + 1] = 255;
                    expectedColorData[index + 2] = 255;
                    expectedColorData[index + 3] = 255;
                }
                service.setColor(expectedColorData, canvasHelperServiceSpy, index);
                service.setColor(expectedColorData, canvasHelperServiceSpy, index);
            }
            condition = !condition;
        }
        expect(service.cheatModeActivated).toBeTruthy();
        service.stopCheating(canvasHelperServiceSpy, canvasHelperServiceSpy, original, modified);
        expect(service.cheatModeActivated).toBeTruthy();
    });
});
