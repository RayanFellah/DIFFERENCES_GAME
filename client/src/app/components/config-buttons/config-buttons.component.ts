import { Component } from '@angular/core';
import { DialogComponent } from '@app/components/dialogue/dialog.component';

@Component({
    selector: 'app-config-buttons',
    templateUrl: './config-buttons.component.html',
    styleUrls: ['./config-buttons.component.scss'],
    providers: [DialogComponent],
})
export class ConfigButtonsComponent {
    constructor(private dialog: DialogComponent) {}

    openConstants(): void {
        this.dialog.openConstantsDialog();
    }

    openHistory(): void {
        this.dialog.openHistoryDialog();
    }
    openReset(): void {
        this.dialog.openResetDialog();
    }
}
