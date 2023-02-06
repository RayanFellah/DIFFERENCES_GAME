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

    img = new Image();
    windowSize = { width: window.innerWidth, height: window.innerHeight };
    sizeCnst = { width: 1920, height: 1080 };
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    heightRatio = 1 / 2.25;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    widthRatio = 1 / 3;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    imgRatio = 640 / 480;

    private canvasSize = { x: 640, y: 480 };
    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    // @HostListener('window:resize', ['$event']) onResize(event: { target: { innerWidth: number; innerHeight: number } }) {
    //     this.windowSize.width = event.target.innerWidth;
    //     this.windowSize.height = event.target.innerHeight;

    //     if (this.goodSize(event.target.innerWidth, event.target.innerHeight)) {
    //         // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    //         this.canvasSize.x = 640;
    //         // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    //         this.canvasSize.y = 480;
    //         // eslint-disable-next-line no-console
    //         console.log('1');
    //     } else if (this.goodWidthOnly(event.target.innerWidth, event.target.innerHeight)) {
    //         this.canvasSize.y = this.heightRatio * event.target.innerHeight;
    //         this.canvasSize.x = this.imgRatio * this.canvasSize.y;
    //         // eslint-disable-next-line no-console
    //         console.log('2');
    //     } else if (this.goodHeighthOnly(event.target.innerWidth, event.target.innerHeight)) {
    //         this.canvasSize.x = this.widthRatio * event.target.innerWidth;
    //         this.canvasSize.y = this.canvasSize.x / this.imgRatio;
    //         // eslint-disable-next-line no-console
    //         console.log('3');
    //     } else {
    //         this.canvasSize.x = this.widthRatio * event.target.innerWidth;
    //         this.canvasSize.y = this.heightRatio * event.target.innerHeight;
    //         // eslint-disable-next-line no-console
    //         console.log('4');
    //     }
    //     const img2 = new Image();
    //     img2 = loadImage(img);
    //     // eslint-disable-next-line no-console
    // }

    // goodSize(width: number, height: number): boolean {
    //     return width === this.sizeCnst.width && height === this.sizeCnst.height;
    // }

    // goodWidthOnly(width: number, height: number): boolean {
    //     return width === this.sizeCnst.width && height !== this.sizeCnst.height;
    // }

    // goodHeighthOnly(width: number, height: number): boolean {
    //     return width !== this.sizeCnst.width && height === this.sizeCnst.height;
    // }

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
            this.img.onload = () => {
                if (this.imgLoadLogic(this.img)) {
                    const context = this.getBackgroundContext();
                    context.globalCompositeOperation = 'copy';
                    context.drawImage(this.img, 0, 0, this.canvasSize.x, this.canvasSize.y);
                    context.globalCompositeOperation = 'source-over';
                }
            };
            this.img.src = this.reader.result as string;
        };
        this.reader.readAsDataURL(target.files[0]);
    }

    imgLoadLogic(img: HTMLImageElement): boolean {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (!(img.width === 640 && img.height === 480)) {
            alert('Les dimensions du fichier ne sont pas corrects');
            return false;
        }
        return true;
    }
}
