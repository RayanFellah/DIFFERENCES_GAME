import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/classes/constants';
import { BmpVerificationService } from '@app/services/bmp-verification.service';
import { ImageUploaderService } from '@app/services/image-uploader.service';
@Component({
    selector: 'app-image-area',
    templateUrl: './image-area.component.html',
    styleUrls: ['./image-area.component.scss'],
})
export class ImageAreaComponent implements OnChanges {
    @Input() parentFile: File;
    @ViewChild('foregroundCanvas', { static: false }) private fCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('backgroundCanvas', { static: false }) private bCanvas!: ElementRef<HTMLCanvasElement>;

    fileName: string = '';
    file: File; // Variable to store file
    img = new Image();
    private canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };

    constructor(private imageUploaderService: ImageUploaderService, private bmpVerificationService: BmpVerificationService) {}
    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    getBackgroundContext(): CanvasRenderingContext2D {
        return this.bCanvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    }

    getForegroundContext(): CanvasRenderingContext2D {
        return this.fCanvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    }

    ngOnChanges(changes: SimpleChanges): void {
        // eslint-disable-next-line no-console
        if (changes.parentFile && changes.parentFile.currentValue) {
            const image = changes.parentFile.currentValue;
            if (this.bmpVerificationService.verifyImage(image)) {
                this.readImage(image);
            }
        }
    }

    fileChange(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.files != null && target.files.length > 0) {
            this.file = target.files[0];
            if (this.bmpVerificationService.verifyImage(this.file)) {
                this.imageUploaderService.setImage(this.file);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                this.readImage(target.files[0]);
            }
            target.value = '';
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readImage(file: File) {
        this.fileName = file.name;
        const reader = new FileReader();
        reader.onload = () => {
            this.img.onload = () => {
                const context = this.getBackgroundContext();
                context.globalCompositeOperation = 'copy';
                context.drawImage(this.img, 0, 0, this.canvasSize.x, this.canvasSize.y);
                context.globalCompositeOperation = 'source-over';
            };
            this.img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
    }

    clearCanvas() {
        this.getBackgroundContext().clearRect(0, 0, this.canvasSize.x, this.canvasSize.y);
        this.fileName = '';
        // eslint-disable-next-line no-console
        console.log('called');
    }
}
