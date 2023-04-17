/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import seedrandom from 'seedrandom';
import { FOUR, HEIGHT, INITIAL_HINTS, THREE_SECONDS, WIDTH } from 'src/constants';
import { AudioService } from './audio.service';
import { CanvasHelperService } from './canvas-helper.service';
import { GameHttpService } from './game-http.service';
import { GameReplayService } from './game-replay/game-replay.service';

// Seed the random number generator

@Injectable({
    providedIn: 'root',
})
export class HintsService {
    hintsLeft: number = INITIAL_HINTS;

    tempCanvas: HTMLCanvasElement;
    tempContext: CanvasRenderingContext2D;
    blockClick: boolean = false;
    activateHint: boolean = false;
    rng: any;
    _secretSeed: string = '';
    private _differences: Vec2[][];
    constructor(
        private readonly gameHttp: GameHttpService,
        private readonly audioService: AudioService,
        private readonly gameReplayService: GameReplayService,
    ) {
        this._secretSeed = Date.now().toString();
        this.rng = seedrandom(this.secretSeed);
    }
    get secretSeed() {
        return this._secretSeed;
    }
    get differences() {
        return this._differences;
    }
    set seed(seed: string) {
        this.rng = seedrandom(seed);
    }
    set differences(differences: Vec2[][]) {
        this._differences = differences;
    }

    getDifferences(id: string) {
        this.gameHttp.getAllDifferences(id).subscribe((res) => {
            this.differences = res;
        });
    }

    reset() {
        this.hintsLeft = 3;
        this.differences = [];
        this.blockClick = false;
        this.activateHint = false;
    }

    executeHint(container: HTMLElement, delay: number): void {
        if (this.hintsLeft === 0 || this.blockClick) return;
        this.blockClick = true;
        this.activateHint = true;
        switch (this.hintsLeft) {
            case 3: {
                this.executeFirstHint(delay, container);
                break;
            }
            case 2: {
                this.executeSecondHint(delay, container);
                break;
            }
            case 1: {
                this.executeThirdHint();
                break;
            }
        }
        this.audioService.playHintSound();
        this.hintsLeft--;
    }

    executeThirdHint() {
        const diff = this.chooseRandomDifference();

        return diff;
    }

    executeSecondHint(delay: number, container?: HTMLElement) {
        this.showDial(FOUR, FOUR, container, delay);
    }

    executeFirstHint(delay: number, container?: HTMLElement) {
        this.showDial(2, 2, container, delay);
    }

    selectDial(randomPoint: Vec2, noColumns: number, noRows: number) {
        const columnWidth = WIDTH / noColumns;
        const rowHeight = HEIGHT / noRows;
        const startPosX = Math.floor(randomPoint.posX / columnWidth) * columnWidth;
        const startPosY = Math.floor(randomPoint.posY / rowHeight) * rowHeight;
        const dial = {
            startPos: { posX: startPosX, posY: startPosY },
            width: columnWidth,
            height: rowHeight,
        };
        return dial;
    }

    showDial(noColumns: number, noRows: number, container?: HTMLElement, delay = THREE_SECONDS) {
        const randomPoint = this.chooseRandomDifference()[Math.floor(this.rng() * this.differences.length)];
        const dial = this.selectDial(randomPoint, noColumns, noRows);
        this.createTempCanvas(container);
        this.tempContext.fillRect(dial.startPos.posX, dial.startPos.posY, dial.width, dial.height);
        this.tempContext.strokeStyle = 'white';
        this.tempContext.lineWidth = 4;
        this.tempContext.strokeRect(dial.startPos.posX, dial.startPos.posY, dial.width, dial.height);
        setTimeout(() => {
            this.tempContext.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
            this.tempCanvas.remove();
            this.blockClick = false;
            this.activateHint = false;
        }, delay);
    }

    removeDifference(diff: Vec2[]) {
        this.differences = this.differences.filter((d2) => {
            return d2.toString() !== diff.toString();
        });
    }

    applyTimePenalty(timePenalty: number, time?: Date) {
        if (this.hintsLeft !== INITIAL_HINTS) {
            if (time) time.setSeconds(time.getSeconds() + timePenalty * (INITIAL_HINTS - this.hintsLeft));
            else this.gameReplayService.addTime(timePenalty);
        }
    }

    private chooseRandomDifference(): Vec2[] {
        const randomDifference = this.differences[Math.floor(this.rng() * this.differences.length)];
        return randomDifference;
    }

    private createTempCanvas(container?: HTMLElement) {
        this.tempCanvas = CanvasHelperService.createCanvas(WIDTH, HEIGHT);
        this.tempCanvas.style.border = '4px solid black';
        this.tempContext = this.tempCanvas.getContext('2d') as CanvasRenderingContext2D;
        this.tempContext.fillStyle = 'rgba(0,0,0,0.3)';
        this.tempCanvas.style.pointerEvents = 'none';
        container?.insertAdjacentElement('afterbegin', this.tempCanvas);
        this.tempCanvas.style.position = 'absolute';
        this.tempCanvas.style.zIndex = '1';
    }
}
