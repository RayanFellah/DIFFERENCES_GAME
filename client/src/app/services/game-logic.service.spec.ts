/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Coord } from '@app/interfaces/coord';
import { of } from 'rxjs';
import { AudioService } from './Audio/audio.service';
import { CanvasTestHelper } from './canvas-test-helper';
import { GameLogicService } from './game-logic.service';
import { HttpService } from './http.service';
import { TimerService } from './timer.service';
describe('GameLogicService tests', () => {
    let service: GameLogicService;
    let leftCanvas: CanvasTestHelper;
    let rightCanvas: CanvasTestHelper;
    let httpService: HttpService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [GameLogicService, CanvasTestHelper, HttpService, AudioService, TimerService],
        });
        service = TestBed.inject(GameLogicService);
        leftCanvas = TestBed.inject(CanvasTestHelper);
        rightCanvas = TestBed.inject(CanvasTestHelper);
        httpService = TestBed.inject(HttpService);
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('start should call getImage twice on httpService', () => {
        const getImageSpy = spyOn(httpService, 'getImage').and.returnValue(of());
        service.start();
        expect(getImageSpy).toHaveBeenCalledTimes(2);
    });
    it('start() should call getDifferences on httpService', () => {
        const getDifferencesSpy = spyOn(httpService, 'getDifferences').and.returnValue(of());
        service.start();
        expect(getDifferencesSpy).toHaveBeenCalled();
    });
    it('should call httpService.playerClick()', () => {
        const playerClickSpy = spyOn(httpService, 'playerClick').and.returnValue(of([{ posX: 10, posY: 20 }]));
        const event = new MouseEvent('click', { clientX: 10, clientY: 20 });
        service.sendCLick(event);
        expect(playerClickSpy).toHaveBeenCalled();
    });
    it('handleClick() should call makeBlink() and playSuccessSound() when diff is not undefined', () => {
        const makeBlinkSpy = spyOn(service, 'makeBlink');
        const playSuccessSoundSpy = spyOn(service.audio, 'playSuccessSound');
        service.handleClick(new MouseEvent('click'), [{ posX: 10, posY: 20 }]);
        expect(makeBlinkSpy).toHaveBeenCalled();
        expect(playSuccessSoundSpy).toHaveBeenCalled();
    });
    it('should create blinking effect on both canvases', (done) => {
        spyOn(leftCanvas.context, 'getImageData').and.returnValue({
            data: new Uint8ClampedArray([0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255]),
        } as never);
        spyOn(rightCanvas.context, 'getImageData').and.returnValue({
            data: new Uint8ClampedArray([0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255]),
        } as never);
        spyOn(leftCanvas.context, 'putImageData').and.callThrough();
        spyOn(rightCanvas.context, 'putImageData').and.callThrough();

        const diff: Coord[] = [
            { posX: 10, posY: 10 },
            { posX: 20, posY: 20 },
        ];
        service['leftCanvas'].context = jasmine.createSpyObj('CanvasRenderingContext2D', ['getImageData', 'putImageData']);
        service['rightCanvas'].context = jasmine.createSpyObj('CanvasRenderingContext2D', ['getImageData', 'putImageData']);

        service.makeBlink(diff);
        setTimeout(() => {
            expect(leftCanvas.context!.putImageData).toHaveBeenCalledTimes(2);
            expect(rightCanvas.context!.putImageData).toHaveBeenCalledTimes(2);
            done();
        }, 1000);
    });
});
