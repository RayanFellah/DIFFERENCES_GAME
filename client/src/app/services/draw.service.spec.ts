// import { DrawingService } from './drawing.service';

// describe('DrawingService', () => {
//     let drawingService: DrawingService;
//     let canvas: HTMLCanvasElement;

//     beforeEach(() => {
//         canvas = document.createElement('canvas');
//         drawingService = new DrawingService(canvas);
//     });

//     it('should be created', () => {
//         expect(drawingService).toBeTruthy();
//     });

//     describe('drawPencil', () => {
//         beforeEach(() => {
//             drawingService.context = canvas.getContext('2d') as CanvasRenderingContext2D;
//         });

//         it('should draw a line when the mouse is moved with the left button down', () => {
//             const event = new MouseEvent('mousemove', { offsetX: 10, offsetY: 10 });
//             drawingService.drawPencil({ type: 'mousedown', offsetX: 0, offsetY: 0 });
//             drawingService.drawPencil(event);
//             expect(drawingService.context.getImageData(9, 9, 1, 1).data[0]).toBe(0); // Check that the pixel at (10, 10) is black
//         });

//         it('should not draw a line when the mouse is moved with the left button up', () => {
//             const event = new MouseEvent('mousemove', { offsetX: 10, offsetY: 10 });
//             drawingService.drawPencil(event);
//             expect(drawingService.context.getImageData(9, 9, 1, 1).data[0]).toBe(0); // Check that the pixel at (10, 10) is not black
//         });
//     });

//     describe('startDrawingRect', () => {
//         beforeEach(() => {
//             drawingService.context = canvas.getContext('2d');
//             drawingService.tempCanvas = document.createElement('canvas');
//             drawingService.tempContext = drawingService.tempCanvas.getContext('2d');
//         });

//         it('should set isDrawingRect to true and save the starting position', () => {
//             const event = new MouseEvent('mousedown', {
//                 offsetX: 10,
//                 offsetY: 10,
//             } as MouseEventInit);
//             drawingService.startDrawingRect(event);
//             expect(drawingService.isDrawingRect).toBeTrue();
//             expect(drawingService.startPos).toEqual({ posX: 10, posY: 10 });
//         });

//         it('should create a temporary canvas and insert it into the container', () => {
//             const container = document.createElement('div');
//             drawingService.startDrawingRect(new MouseEvent('mousedown', { offsetX: 0, offsetY: 0 } as MouseEventInit), container);
//             expect(drawingService.tempCanvas).toBeTruthy();
//             expect(container.contains(drawingService.tempCanvas)).toBeTrue();
//         });
//     });

//     describe('drawRectangle', () => {
//         beforeEach(() => {
//             drawingService.context = canvas.getContext('2d');
//             drawingService.tempCanvas = document.createElement('canvas');
//             drawingService.tempContext = drawingService.tempCanvas.getContext('2d');
//             drawingService.startPos = { posX: 0, posY: 0 };
//             drawingService.isDrawingRect = true;
//         });

//         it('should fill a rectangle on the temporary canvas with the current color', () => {
//             const event = new MouseEvent('mousemove', { offsetX: 10, offsetY: 10 } as MouseEventInit);
//             drawingService.drawRectangle(event);
//             const pixelData = drawingService.tempContext.getImageData(5, 5, 1, 1).data;
//             expect(pixelData[0]).toBe(0);
//             expect(pixelData[1]).toBe(0);
//         });
//     });
// });
