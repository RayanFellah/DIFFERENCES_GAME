import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogService } from '@app/services/dialog-service/dialog.service';
@Component({
    selector: 'app-game-over-dialog',
    templateUrl: './game-over-dialog.component.html',
    styleUrls: ['./game-over-dialog.component.scss'],
})
export class GameOverDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: string, private dialogService: DialogService) {}
    replay(): void {
        this.dialogService.emitReplay(true);
    }
}
