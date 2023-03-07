import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { DrawingService } from '@app/services/draw.service';

@Component({
    selector: 'app-drawing',
    templateUrl: './drawing.component.html',
    styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements OnInit, AfterViewInit {
    @Input() canvas: HTMLCanvasElement;
    drawingService: DrawingService;
    context: CanvasRenderingContext2D;
    tools: {
        [key: string]: boolean;
        pencil: boolean;
        rectangle: boolean;
        eraser: boolean;
    } = {
        pencil: false,
        rectangle: false,
        eraser: false,
    };

    ngOnInit() {
        this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    }

    ngAfterViewInit(): void {
        this.drawingService = new DrawingService(this.canvas);
    }
    setUsedTool(toolName: string) {
        for (const tool of Object.keys(this.tools)) {
            if (this.tools[tool] && tool !== toolName) {
                this.tools[tool] = false;
            }
        }
        this.tools[toolName] = !this.tools[toolName];
    }

    draw(event: MouseEvent, component: HTMLDivElement, keyboardEvent?: KeyboardEvent) {
        if (this.tools.pencil) {
            this.canvas.style.cursor = "url('./assets/pencil.png'), auto";
            this.drawingService.drawPencil(event);
        }
        if (this.tools.rectangle) {
            if (event.type === 'mousedown') {
                this.drawingService.startDrawingRect(event, component);
            }
            if (event.type === 'mousemove') {
                this.canvas.style.cursor = 'crosshair';
                this.drawingService.drawRectangle(event, keyboardEvent);
            }
        }
        if (this.tools.eraser) {
            this.canvas.style.cursor = "url('./assets/eraser.png'), auto";
            this.drawingService.erase(event);
        }
    }
    stop(event: MouseEvent) {
        this.drawingService.stop(event);
        this.canvas.style.cursor = 'default';
    }
    changeColor(event: Event) {
        const color = (event.target as HTMLInputElement).value;
        this.drawingService.drawColor = color;
    }
    changePencilWidth(event: Event) {
        const pencilWidth = (event.target as HTMLInputElement).value;
        this.drawingService.pencilWidth = parseInt(pencilWidth, 10);
    }
    reset() {
        this.drawingService.reset();
    }
    undo() {
        this.drawingService.undo();
    }
    redo() {
        this.drawingService.redo();
    }
    keyEvents(keyEvent: KeyboardEvent) {
        if (keyEvent.ctrlKey && keyEvent.shiftKey && keyEvent.key === 'Z') {
            this.redo();
        } else if (keyEvent.ctrlKey && keyEvent.key === 'z') {
            this.undo();
        }
    }
}
