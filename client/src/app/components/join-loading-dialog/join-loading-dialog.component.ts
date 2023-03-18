import { Component } from '@angular/core';
import { DialogService } from '@app/services/dialog-service/dialog.service';

@Component({
    selector: 'app-join-loading-dialog',
    templateUrl: './join-loading-dialog.component.html',
    styleUrls: ['./join-loading-dialog.component.scss'],
})
export class JoinLoadingDialogComponent {
    constructor(private dialogService: DialogService) {}
    cancelJoin() {
        this.dialogService.emitJoinCancellation();
    }
}
