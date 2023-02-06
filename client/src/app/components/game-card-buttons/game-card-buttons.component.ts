import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-game-card-buttons',
    templateUrl: './game-card-buttons.component.html',
    styleUrls: ['./game-card-buttons.component.scss'],
})
export class GameCardButtonsComponent implements OnInit {
    @Input() isConfigPage: boolean;
    @Input() gameIndex: number;

    @Output() deleteGame = new EventEmitter();
    @Output() playGame = new EventEmitter();
    @Output() createMultiGame = new EventEmitter();
    @Output() resetScores = new EventEmitter();

    constructor() {}

    ngOnInit(): void {}

    callDeleteGame(index: number) {
        this.deleteGame.emit(index);
    }

    callPlayGame() {
        this.playGame.emit();
    }

    callCreateMultiGame() {
        this.createMultiGame.emit();
    }

    callResetScores() {
        this.resetScores.emit();
    }
}
