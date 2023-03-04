import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FileUploaderService } from '@app/services/file-uploader.service';
import { Subscription } from 'rxjs';
import { HEIGHT, WIDTH } from 'src/constants';

@Component({
    selector: 'app-image-area',
    templateUrl: './image-area.component.html',
    styleUrls: ['./image-area.component.scss'],
})
export class ImageAreaComponent implements OnInit, OnDestroy {
    @Input() side: 'left' | 'right';
    @ViewChild('foreground', { static: false }) private fCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('background', { static: false }) private bCanvas!: ElementRef<HTMLCanvasElement>;

    file: File;
    img = new Image();
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
    ngOnDestroy(): void {
        this.fileUploadSubscription.unsubscribe();
    }
    getBackgroundContext(): CanvasRenderingContext2D {
        return this.bCanvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    }

    getForegroundContext(): CanvasRenderingContext2D {
        return this.fCanvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    }

    clearCanvas() {
        this.getBackgroundContext().clearRect(0, 0, this.width, this.height);
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
