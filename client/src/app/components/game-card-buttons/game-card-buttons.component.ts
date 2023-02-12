import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogPalyerNameComponent } from '@app/dialog-palyer-name/dialog-palyer-name.component';

@Component({
    selector: 'app-game-card-buttons',
    templateUrl: './game-card-buttons.component.html',
    styleUrls: ['./game-card-buttons.component.scss'],
})
export class GameCardButtonsComponent implements OnInit {
    @Input() isConfigPage: boolean;
    @Input() gameIndex: number;
    @Input() selectedGame: string;

    @Output() playGame = new EventEmitter();
    @Output() createMultiGame = new EventEmitter();
    @Output() resetScores = new EventEmitter();

    constructor(public dialog: MatDialog) {}

    ngOnInit(): void {}

    openDialog(): void {
        this.dialog.open(DialogPalyerNameComponent, { data: { name: this.playGame } });
    }

    closeDialog(): void {
        this.dialog.closeAll();
    }

    callDeleteGame(index: number) {
        this.deleteGame.emit(index);
    }

    callPlayGame() {
        this.playGame.emit();
        console.log(this.selectedGame);
    }

    callCreateMultiGame() {
        this.createMultiGame.emit();
    }

    callResetScores() {
        this.resetScores.emit();
    }
}
