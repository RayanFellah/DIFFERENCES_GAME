import { AfterViewInit, Component, ElementRef, OnChanges, SimpleChanges, ViewChild } from '@angular/core';

@Component({
    selector: 'app-image-area',
    templateUrl: './image-area.component.html',
    styleUrls: ['./image-area.component.scss'],
})
export class ImageAreaComponent implements AfterViewInit, OnChanges {
    @ViewChild('foregroundCanvas', { static: false }) private fCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('backgroundCanvas', { static: false }) private bCanvas!: ElementRef<HTMLCanvasElement>;

    reader: FileReader;

    private canvasSize = { x: 640, y: 480 };

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

    clearForeground() {
        this.getForegroundContext().clearRect(0, 0, this.width, this.height);
    }

    ngAfterViewInit(): void {
        this.bCanvas.nativeElement.focus();
        this.clearForeground();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.resetAll && !changes.resetAll.firstChange) {
            this.clearForeground();
        }
    }

    fileChange(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.files != null && target.files.length > 0) {
            this.readImage(target);
        }
        target.value = '';
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readImage(target: any) {
        if (!(target.files[0].type === 'image/bmp')) {
            alert('Le format du fichier est invalide: ' + target.files[0].type);
            return;
        }
        this.reader = new FileReader();
        this.reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                if (this.imgLoadLogic(img)) {
                    const context = this.getBackgroundContext();
                    context.globalCompositeOperation = 'copy';
                    context.drawImage(img, 0, 0, this.width, this.height);
                    context.globalCompositeOperation = 'source-over';
                }
            };
            img.src = this.reader.result as string;
            // eslint-disable-next-line no-console
            console.log(img.src);
        };
        this.reader.readAsDataURL(target.files[0]);
    }

    imgLoadLogic(img: HTMLImageElement): boolean {
        if (!(img.width === this.width && img.height === this.height)) {
            alert('Les dimensions du fichier ne sont pas corrects');
            return false;
        }
        return true;
    }
}
