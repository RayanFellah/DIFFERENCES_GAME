import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import { FileUploaderService } from '@app/services/file-uploader.service';
import { Subscription } from 'rxjs';
import { HEIGHT, WIDTH } from 'src/constants';

@Component({
    selector: 'app-image-area',
    templateUrl: './image-area.component.html',
    styleUrls: ['./image-area.component.scss'],
})
export class ImageAreaComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input() side: 'left' | 'right';
    @Output() leftPosition: EventEmitter<string> = new EventEmitter();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Output() canvasMerged: EventEmitter<any> = new EventEmitter();
    @ViewChild(DrawingComponent) drawingTool: DrawingComponent;
    @ViewChild('canvasContainer', { static: false }) divContainer!: ElementRef<HTMLDivElement>;

    @ViewChild('foreground', { static: false }) fCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('background', { static: false }) bCanvas!: ElementRef<HTMLCanvasElement>;
    file: File;
    img = new Image();
    defaultStateCanvas: CanvasRenderingContext2D;
    private fileUploadSubscription: Subscription;
    constructor(private readonly fileUploaderService: FileUploaderService) {}

    get width() {
        return WIDTH;
    }
    get height() {
        return HEIGHT;
    }
    ngOnInit(): void {
        this.fileUploadSubscription = this.fileUploaderService.getCanvasImageSource(this.side).subscribe((file: File) => {
            this.file = file;
            if (file) this.drawImageOnCanvas();
            else this.clearCanvas();
        });
    }

    ngAfterViewInit(): void {
        if (this.getBackgroundContext()) this.setDefaultState();
    }

    getBackgroundContext(): CanvasRenderingContext2D {
        return this.bCanvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    }

    getForegroundContext(): CanvasRenderingContext2D {
        return this.fCanvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    }

    clearCanvas() {
        if (this.getBackgroundContext()) this.setDefaultState();
    }
    draw(event: MouseEvent, keyboardEvent?: KeyboardEvent) {
        this.drawingTool.draw(event, this.divContainer.nativeElement, keyboardEvent);
    }
    stop(event: MouseEvent) {
        this.drawingTool.stop(event);
    }

    keyEvents(event: KeyboardEvent) {
        this.drawingTool.keyEvents(event);
    }

    setDefaultState() {
        this.getBackgroundContext().fillStyle = 'white';
        this.getBackgroundContext().fillRect(0, 0, this.width, this.height);
    }

    ngOnDestroy(): void {
        this.fileUploadSubscription.unsubscribe();
    }

    private drawImageOnCanvas() {
        const reader = new FileReader();
        reader.onload = () => {
            this.img.onload = () => {
                const context = this.getBackgroundContext();
                context.globalCompositeOperation = 'copy';
                context.drawImage(this.img, 0, 0, this.width, this.height);
                context.globalCompositeOperation = 'source-over';
            };
            this.img.src = reader.result as string;
        };
        reader.readAsDataURL(this.file);
    }
}
