import { Component } from '@angular/core';
import { DialogService } from '@app/services/dialog-service/dialog.service';

@Component({
    selector: 'app-join-limited-time',
    templateUrl: './join-limited-time.component.html',
    styleUrls: ['./join-limited-time.component.scss'],
})
export class JoinLimitedTimeComponent {
    constructor(private dialogService: DialogService) {}

    selectSolo() {
        this.dialogService.selectSoloLimitedTimeMode();
    }

    selectCoop() {
        this.dialogService.selectCoopLimitedTimeMode();
    }
}
