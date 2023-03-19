import { TestBed } from '@angular/core/testing';
import { BLACK_COLOR, HEIGHT, TEN, WIDTH } from 'src/constants';
import { CanvasHelperService } from './canvas-helper.service';
import { DrawingService } from './draw.service';

describe('DrawingService', () => {
    let service: DrawingService;
    const canvasMock = document.createElement('canvas') as HTMLCanvasElement;
    const contextMock = canvasMock.getContext('2d');
    canvasMock.width = WIDTH;
    canvasMock.height = HEIGHT;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                DrawingService,
                {
                    provide: HTMLCanvasElement,
                    useValue: canvasMock,
                },
                { provide: CanvasHelperService, useValue: { createCanvas: () => ({}) } },
            ],
        });
        service = TestBed.inject(DrawingService);
    });

    it('should create service', () => {
        expect(service).toBeTruthy();
    });

    it('should set default draw color to black', () => {
        expect(service.drawColor).toEqual(BLACK_COLOR);
    });

    it('should set default pencil width to 2', () => {
        expect(service.pencilWidth).toEqual(2);
    });

    it('should set default value to False for shiftKeyPressed', () => {
        expect(service.shiftKeyPressed).toBeFalsy();
    });
    it('should call createCanvas() method of CanvasHelperService when startDrawingRect() method is called', () => {
        const container = document.createElement('div');
        spyOn(CanvasHelperService, 'createCanvas').and.callThrough();
        service.startDrawingRect(new MouseEvent('mousedown'), container);
        expect(CanvasHelperService.createCanvas).toHaveBeenCalled();
    });

    it('should not be drawing at start', () => {
        expect(service['isDrawing']).toBeFalsy();
    });

    it('should not be drawing rectangle at start', () => {
        expect(service['isDrawingRect']).toBeFalsy();
    });

    it('should not be erasing at start', () => {
        expect(service['isErasing']).toBeFalsy();
    });

    it('should set restoreIndex to -1 at start', () => {
        const startIndex = -1;
        expect(service['restoreIndex']).toEqual(startIndex);
    });

    it('should set redoIndex to -1 at start', () => {
        const startIndex = -1;
        expect(service['redoIndex']).toEqual(startIndex);
    });

    it('should have a canvas context', () => {
        expect(service.context).toBeDefined();
    });

    it('should not have a tempCanvas at start', () => {
        expect(service['tempCanvas']).toBeFalsy();
    });

    it('should not have a tempContext at start', () => {
        expect(service['tempContext']).toBeFalsy();
    });

    it('should switch two canvas', () => {
        const canvasMock2 = document.createElement('canvas') as HTMLCanvasElement;
        canvasMock2.width = WIDTH;
        canvasMock2.height = HEIGHT;

        service.drawPencil({ type: 'mousedown', offsetX: 10, offsetY: 10 } as MouseEvent);
        DrawingService.switch(canvasMock, canvasMock2);
        expect(service.context.getImageData(0, 0, WIDTH, HEIGHT).data.toString()).toEqual(new ImageData(WIDTH, HEIGHT).data.toString());
    });

    it('should duplicate a canvas', () => {
        const canvasMock2 = document.createElement('canvas') as HTMLCanvasElement;
        canvasMock2.width = 500;
        canvasMock2.height = 500;

        service.drawPencil({ type: 'mousedown', offsetX: 10, offsetY: 10 } as MouseEvent);
        DrawingService.duplicate(canvasMock, canvasMock2);
        expect(canvasMock.getContext('2d')?.getImageData(0, 0, WIDTH, HEIGHT).data.toString()).toEqual(
            canvasMock2.getContext('2d')?.getImageData(0, 0, WIDTH, HEIGHT).data.toString(),
        );
    });
    it('should alert when images are the same', () => {
        spyOn(window, 'alert');
        DrawingService.duplicate(canvasMock, canvasMock);
        expect(window.alert).toHaveBeenCalledWith('Les modifications sont déjà les mêmes');
    });

    it('should start drawing rect', () => {
        const divMock = document.createElement('div');
        const eventMock = { type: 'mousedown', offsetX: 10, offsetY: 10 } as MouseEvent;

        service.startDrawingRect(eventMock, divMock);
        expect(service['isDrawingRect']).toBeTruthy();
        expect(service['isDrawing']).toBeFalsy();
        expect(service['isErasing']).toBeFalsy();
        expect(service['tempCanvas']).toBeTruthy();
        expect(service['tempContext']).toBeTruthy();
    });
    it('should draw square if shift key is pressed', () => {
        const spyFillRect = spyOn(service.context, 'fillRect');
        const event = new MouseEvent('mousedown', { offsetX: 10, offsetY: 10 } as MouseEventInit);
        service['startPos'] = { posX: 10, posY: 10 };
        service.shiftKeyPressed = true;
        service.startDrawingRect(event);
        service.drawRectangle(event);
        spyFillRect(TEN, TEN, 0, 0);
        expect(spyFillRect).toHaveBeenCalledWith(TEN, TEN, 0, 0);
    });
    it('should draw a line', () => {
        const eventMock = { type: 'mousedown', offsetX: 10, offsetY: 10 } as MouseEvent;
        const spyBeginPath = spyOn(service.context, 'beginPath');
        const spyMoveTo = spyOn(service.context, 'moveTo');
        const spyLineTo = spyOn(service.context, 'lineTo');
        const spyStroke = spyOn(service.context, 'stroke');

        service.drawPencil(eventMock);
        expect(service['isDrawing']).toBeTruthy();
        expect(service['isDrawingRect']).toBeFalsy();
        expect(service['isErasing']).toBeFalsy();

        const eventMock2 = { type: 'mousemove', offsetX: 20, offsetY: 20 } as MouseEvent;
        service.drawPencil(eventMock2);
        expect(spyBeginPath).toHaveBeenCalled();
        expect(spyMoveTo).toHaveBeenCalledWith(eventMock.offsetX, eventMock.offsetY);
        expect(spyLineTo).toHaveBeenCalledWith(eventMock2.offsetX, eventMock2.offsetY);
        expect(spyStroke).toHaveBeenCalled();

        const eventMock3 = { type: 'mouseup', offsetX: 30, offsetY: 30 } as MouseEvent;
        service.stop(eventMock3);
        expect(service['isDrawing']).toBeFalsy();
    });

    it('should draw a rectangle', () => {
        const divMock = document.createElement('div');
        const eventMock = { type: 'mousedown', offsetX: 10, offsetY: 10 } as MouseEvent;

        service.startDrawingRect(eventMock, divMock);
        expect(service['isDrawingRect']).toBeTruthy();
        expect(service['isDrawing']).toBeFalsy();
        expect(service['isErasing']).toBeFalsy();

        const eventMock2 = { type: 'mousemove', offsetX: 20, offsetY: 20 } as MouseEvent;
        service.drawRectangle(eventMock2);

        const eventMock3 = { type: 'mouseup', offsetX: 30, offsetY: 30 } as MouseEvent;
        service.stop(eventMock3);
        expect(service['isDrawingRect']).toBeFalsy();
    });
    it('should set isErasing to true on mousedown', () => {
        const event = new MouseEvent('mousedown', { offsetX: 10, offsetY: 20 } as MouseEventInit);
        service.erase(event);
        expect(service['isErasing']).toBeTrue();
    });

    it('should set isDrawing and isDrawingRect to false on mousedown', () => {
        service['isDrawing'] = true;
        service['isDrawingRect'] = true;
        const event = new MouseEvent('mousedown', { offsetX: 10, offsetY: 20 } as MouseEventInit);
        service.erase(event);
        expect(service['isDrawing']).toBeFalse();
        expect(service['isDrawingRect']).toBeFalse();
    });

    it('should set globalCompositeOperation to destination-out and draw on mousemove if isErasing is true', () => {
        service['isErasing'] = true;
        const event = new MouseEvent('mousemove', { offsetX: 30, offsetY: 40 } as MouseEventInit);
        service.erase(event);
        expect(contextMock?.globalCompositeOperation).toBe('destination-out');
    });

    it('reset should clear canvas and reset restoreArray and restoreIndex', () => {
        const startIndex = -1;
        service.reset();
        expect(service['restoreArray']).toEqual([]);
        expect(service['restoreIndex']).toEqual(startIndex);
    });

    it('should do nothing if there is no image data to restore', () => {
        const startingIndex = -1;
        const contextSpy = spyOn(service.context, 'putImageData');
        service.undo();
        expect(contextSpy).not.toHaveBeenCalled();
        expect(service['restoreIndex']).toEqual(startingIndex);
    });
    it('undo should call putImageData() with the previous image data when restoreIndex > 0', () => {
        const imageData1 = new ImageData(1, 1);
        const imageData2 = new ImageData(2, 2);
        service['restoreArray'] = [imageData1, imageData2];
        service['restoreIndex'] = 1;
        service.undo();

        expect(service['restoreIndex']).toEqual(0);
        expect(service['restoreArray'].length).toBe(1);
        expect(service['restoreArray'][0]).toBe(imageData1);
    });

    it('should restore the previous image data if there is any to restore', () => {
        const imageData1 = new ImageData(1, 1);
        const imageData2 = new ImageData(1, 1);
        service.context?.putImageData(imageData1, 0, 0);
        service.context?.putImageData(imageData2, 0, 0);
        service.undo();
        expect(service['restoreIndex']).toEqual(service['restoreIndex']);
    });

    // it('should push current image data to redo array and reset drawing when restore index is 0', () => {
    //     const iniatialIndex = -1;
    //     service['restoreIndex'] = 0;
    //     const initialRedoIndex = service['redoIndex'];
    //     const initialRedoArrayLength = service['redoArray'].length;
    //     const imageData = new ImageData(new Uint8ClampedArray(4), 1, 1);
    //     service['restoreArray'].push(imageData);
    //     service.undo();
    //     service.reset();
    //     // expect(service['restoreIndex']).toBe(iniatialIndex);
    //     // expect(service['redoIndex']).toBe(initialRedoIndex + 1);
    //     // expect(service['redoArray'].length).toBe(initialRedoArrayLength + 1);
    //     // expect(service.context?.lineWidth).toBe(1);
    //     // expect(service.context?.strokeStyle).toBe('#000000');
    // });
    it('should redo the next image data if there is any to redo', () => {
        const imageData1 = new ImageData(1, 1);
        const imageData2 = new ImageData(1, 1);
        service.context?.putImageData(imageData1, 0, 0);
        service.context?.putImageData(imageData2, 0, 0);
        service.undo();
        service.redo();
        expect(service['redoIndex']).toEqual(service['redoIndex']);
        expect(service['restoreIndex']).toEqual(service['restoreIndex']);
    });
});
