import { Component } from '@angular/core';
import { DialogService } from '@app/services/dialog-service/dialog.service';

@Component({
    selector: 'app-loading-dialog',
    templateUrl: './loading-dialog.component.html',
    styleUrls: ['./loading-dialog.component.scss'],
})
export class LoadingDialogComponent {
    constructor(private dialogService: DialogService) {}
    cancelCreation() {
        this.dialogService.emitCancellation();
    }
}
