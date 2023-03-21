import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DrawingService } from '@app/services/draw.service';

import { DrawingComponent } from './drawing.component';

describe('DrawingComponent', () => {
    let component: DrawingComponent;
    let fixture: ComponentFixture<DrawingComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DrawingComponent],
            providers: [DrawingService],
        }).compileComponents();

        fixture = TestBed.createComponent(DrawingComponent);
        component = fixture.componentInstance;
        const canvas = document.createElement('canvas');
        component.canvas = canvas;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('setUsedTool should set the used tool and reset the others', () => {
        const toolName = 'pencil';
        component.tools.rectangle = true;
        component.tools.eraser = true;
        component.setUsedTool(toolName);
        expect(component.tools.pencil).toBeTruthy();
        expect(component.tools.rectangle).toBeFalsy();
        expect(component.tools.eraser).toBeFalsy();
        component.setUsedTool(toolName);
        expect(component.tools.pencil).toBeFalsy();
    });
    it('draw should draw pencil on canvas when pencil tool is selected', () => {
        spyOn(component.drawingService, 'drawPencil');
        component.setUsedTool('pencil');
        const canvas = component.canvas;
        const event = new MouseEvent('mousedown', { clientX: 10, clientY: 20 });
        component.draw(event);
        expect(canvas.style.cursor).toEqual(canvas.style.cursor);
        expect(component.drawingService.drawPencil).toHaveBeenCalledWith(event);
    });
    it('draw should draw rectangle on canvas when rectangle tool is selected', () => {
        spyOn(component.drawingService, 'startDrawingRect');
        spyOn(component.drawingService, 'drawRectangle');
        component.setUsedTool('rectangle');
        const canvas = component.canvas;
        const div = document.createElement('div');
        div.appendChild(canvas);
        const event = new MouseEvent('mousedown', { clientX: 10, clientY: 20 });
        component.draw(event, div);
        expect(canvas.style.cursor).toEqual(canvas.style.cursor);
        expect(component.drawingService.startDrawingRect).toHaveBeenCalledWith(event, div);
        expect(component.drawingService.drawRectangle).not.toHaveBeenCalled();
        const mousemoveEvent = new MouseEvent('mousemove', { clientX: 50, clientY: 60 });
        component.draw(mousemoveEvent, div);
        expect(component.drawingService.drawRectangle).toHaveBeenCalledWith(mousemoveEvent);
    });
    it('draw should erase on canvas when eraser tool is selected', () => {
        spyOn(component.drawingService, 'erase');
        component.setUsedTool('eraser');
        const canvas = component.canvas;
        const event = new MouseEvent('mousedown', { clientX: 10, clientY: 20 });
        component.draw(event);
        expect(canvas.style.cursor).toEqual(canvas.style.cursor);
        expect(component.drawingService.erase).toHaveBeenCalledWith(event);
    });
    it('draw should call stop method of drawingService and reset the cursor to default', () => {
        const mockMouseEvent = new MouseEvent('mouseup');
        spyOn(component.drawingService, 'stop');
        component.stop(mockMouseEvent);
        expect(component.drawingService.stop).toHaveBeenCalledWith(mockMouseEvent);
        expect(component.canvas.style.cursor).toBe('default');
    });
    it('changeColor() should change the drawColor property of the drawingService when called', () => {
        const input = document.createElement('input');
        input.value = '#ff0000';
        const event = { target: input } as unknown as Event;
        component.changeColor(event);
        expect(component.drawingService.drawColor).toEqual('#ff0000');
    });
    it('draw() should change the pencil width when a new value is provided', () => {
        const input = document.createElement('input');
        input.value = '5';
        const event = new Event('input');
        Object.defineProperty(event, 'target', { writable: false, value: input });
        component.changePencilWidth(event);
        expect(component.drawingService.pencilWidth).toBe(parseInt(input.value, 10));
    });
    it('reset() should call the reset() method of the drawingService', () => {
        spyOn(component.drawingService, 'reset');
        component.reset();
        expect(component.drawingService.reset).toHaveBeenCalled();
    });
    it('undo() should call the undo() method of the drawingService', () => {
        spyOn(component.drawingService, 'undo');
        component.undo();
        expect(component.drawingService.undo).toHaveBeenCalled();
    });
    it('redo() should call the redo() method of the drawingService', () => {
        spyOn(component.drawingService, 'redo');
        component.redo();
        expect(component.drawingService.redo).toHaveBeenCalled();
    });
    it('should call redo() when ctrl + shift + z are pressed', () => {
        spyOn(component, 'redo');
        const event = new KeyboardEvent('keydown', { ctrlKey: true, shiftKey: true, key: 'Z' });
        component.keyEvents(event);
        expect(component.redo).toHaveBeenCalled();
    });

    it('should call undo() when ctrl + z are pressed', () => {
        spyOn(component, 'undo');
        const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'z' });
        component.keyEvents(event);
        expect(component.undo).toHaveBeenCalled();
    });
});
