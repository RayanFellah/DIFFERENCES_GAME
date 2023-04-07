import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-game-score-dialog',
    templateUrl: './game-score-dialog.component.html',
    styleUrls: ['./game-score-dialog.component.scss'],
})
export class GameScoreDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: unknown) {}
}
