/* eslint-disable @typescript-eslint/no-empty-function */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Vec2 } from '@app/interfaces/vec2';
import { HEIGHT, ONE_SECOND, WIDTH } from 'src/constants';
import { CanvasHelperService } from './canvas-helper.service';

describe('CanvasHelperService', () => {
    let service: CanvasHelperService;
    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D;

    beforeEach(() => {
        canvas = document.createElement('canvas');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        document.body.appendChild(canvas);

        context = canvas.getContext('2d') as CanvasRenderingContext2D;
        spyOn(canvas, 'getContext').and.returnValue(context);

        TestBed.configureTestingModule({
            imports: [],
            providers: [CanvasHelperService, { provide: HTMLCanvasElement, useValue: canvas }],
        });

        service = TestBed.inject(CanvasHelperService);
    });

    afterEach(() => {
        document.body.removeChild(canvas);
    });

    it('should create the service', () => {
        expect(service).toBeTruthy();
    });
    it('getColor should return image data', () => {
        const imageData = service.getColor();
        expect(imageData).toBeDefined();
        expect(imageData instanceof ImageData).toBe(true);
    });
    it('updateImage should update image with the new color', () => {
        const testColorNumber = 255;
        const coords: Vec2[] = [{ posX: 0, posY: 0 }];
        const color1 = new ImageData(new Uint8ClampedArray([testColorNumber, testColorNumber, testColorNumber, testColorNumber]), 1, 1);
        const color2 = new ImageData(new Uint8ClampedArray([0, 0, 0, testColorNumber]), 1, 1);
        const spy = spyOn(context, 'putImageData').and.callThrough();

        service.updateImage(coords, color1, color2);

        expect(spy).toHaveBeenCalled();
    });
    it('displayErrorMessage should display error message and restore previous image after one second', fakeAsync(() => {
        const testColorNumber = 255;
        const errorMessage = 'ERROR';
        const mockImageData = new ImageData(new Uint8ClampedArray([testColorNumber, 0, 0, testColorNumber]), 1, 1);
        const mockMouseEvent = new MouseEvent('click', { offsetX: 10, offsetY: 20 } as MouseEventInit);

        spyOn(service.context, 'getImageData' as never).and.returnValue(mockImageData as never);
        spyOn(service.context, 'fillText' as never);
        service.displayErrorMessage(mockMouseEvent);
        expect(service.context?.fillText).toHaveBeenCalledWith(
            errorMessage as never,
            mockMouseEvent.offsetX as never,
            mockMouseEvent.offsetY as never,
        );

        spyOn(service.context, 'putImageData' as never);
        tick(ONE_SECOND);
        expect(service.context?.putImageData).toHaveBeenCalledWith(mockImageData, 0, 0);
    }));
    it('should restore the previous image data if temp is defined', fakeAsync(() => {
        const blob = new Blob();
        spyOn(URL, 'createObjectURL').and.returnValue('fake-url');
        service.drawImageOnCanvas(blob);
        tick();
        const tempImageData = service.getColor();
        spyOn(service.context, 'putImageData' as never);
        service.displayErrorMessage(new MouseEvent('click', { offsetX: 0, offsetY: 0 } as MouseEventInit));
        tick(ONE_SECOND);
        expect(service.context?.putImageData).toHaveBeenCalledWith(tempImageData, 0, 0);
        expect(service.disable).toBeFalse();
    }));
});
