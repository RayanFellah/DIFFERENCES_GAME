import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogPalyerNameComponent } from '@app/dialog-palyer-name/dialog-palyer-name.component';
// import { HttpService } from '@app/services/http.service';
@Component({
    selector: 'app-game-card-buttons',
    templateUrl: './game-card-buttons.component.html',
    styleUrls: ['./game-card-buttons.component.scss'],
})
export class GameCardButtonsComponent {
    @Input() isConfigPage: boolean;
    @Input() gameIndex: number;
    @Input() selectedGame: string;

    @Output() deleteGame = new EventEmitter();
    @Output() selectGame = new EventEmitter();
    @Output() playGame = new EventEmitter();
    @Output() createMultiGame = new EventEmitter();
    @Output() resetScores = new EventEmitter();

    @Input() idx: number;
    @Output() sendIdx = new EventEmitter<{ id: number; message: string }>();

    constructor(public dialog: MatDialog) {}

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
    }

    callCreateMultiGame() {
        this.createMultiGame.emit();
    }

    callResetScores() {
        this.resetScores.emit();
    }

    callSelectGame(index: number) {
        this.selectGame.emit(index);
    }

    sendIndex() {
        this.sendIdx.emit({ id: this.idx, message: 'I Have been clicked' });
        this.openDialog();
    }
}
