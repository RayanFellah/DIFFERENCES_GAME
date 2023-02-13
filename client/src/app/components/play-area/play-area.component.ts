import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { CanvasTestHelper } from '@app/services/canvas-test-helper';
import { GameLogicService } from '@app/services/game-logic.service';
import { HttpService } from '@app/services/http.service';
// import { HttpService } from '@app/services/http.service';

// TODO : Avoir un fichier séparé pour les constantes!
export const DEFAULT_WIDTH = 500;
export const DEFAULT_HEIGHT = 500;

// TODO : Déplacer ça dans un fichier séparé accessible par tous
export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements OnInit {
    @ViewChild('canvas1', { static: false }) private canvas1!: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas2', { static: false }) private canvas2!: ElementRef<HTMLCanvasElement>;
    mousePositionOriginal: Vec2 = { x: 0, y: 0 };
    mousePositionModified: Vec2 = { x: 0, y: 0 };

    // buttonPressed = '';

    private canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
    constructor(private logic: GameLogicService, private http: HttpService) {}

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    // @HostListener('keydown', ['$event'])
    // buttonDetect(event: KeyboardEvent) {
    //     this.buttonPressed = event.key;
    // }

    ngOnInit(): void {
        // this.drawService.context = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        // this.drawService.drawGrid();
        // this.drawService.drawWord('Différence');
        // this.canvas.nativeElement.focus();
        this.logic = new GameLogicService(
            new CanvasTestHelper(this.canvas1.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D),
            new CanvasTestHelper(this.canvas2.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D),
            this.http,
        );
        this.logic.start();
    }

    async handleClick(event: MouseEvent) {
        await this.logic.handleClick(event);
    }
    // @HostListener('keydown', ['$event'])
    // buttonDetect(event: KeyboardEvent) {
    //     this.buttonPressed = event.key;
    // }

    // ngAfterViewInit(): void {
    //     // this.drawService.context = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    //     // this.drawService.drawGrid();
    //     // this.drawService.drawWord('Différence');
    //     // this.canvas.nativeElement.focus();
    // }

    // // TODO : déplacer ceci dans un service de gestion de la souris!
    // mouseHitDetectOrigin(event: MouseEvent) {
    //     if (event.button === MouseButton.Left) {
    //         this.mousePositionOriginal = { x: event.offsetX, y: event.offsetY };
    //     }
    // }

    // mouseHitDetectModified(event: MouseEvent) {
    //     if (event.button === MouseButton.Left) {
    //         this.mousePositionModified = { x: event.offsetX, y: event.offsetY };
    //     }
    // }
}
