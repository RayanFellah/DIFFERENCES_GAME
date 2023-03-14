import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogService } from '@app/services/dialog-service/dialog.service';

@Component({
    selector: 'app-loading-dialog',
    templateUrl: './loading-dialog.component.html',
    styleUrls: ['./loading-dialog.component.scss'],
})
export class LoadingDialogComponent {
    playerNames: string[] = [];
    constructor(
        private dialogService: DialogService,
        public dialogRef: MatDialogRef<LoadingDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { playerName: string },
    ) {}

    cancelCreation() {
        this.dialogService.emitCancellation();
    }
}
