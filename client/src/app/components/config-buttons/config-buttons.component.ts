import { Component, OnInit } from '@angular/core';
import { DialogComponent } from '@app/components/dialogue/dialog.component';

@Component({
    selector: 'app-config-buttons',
    templateUrl: './config-buttons.component.html',
    styleUrls: ['./config-buttons.component.scss'],
    providers: [DialogComponent],
})
export class ConfigButtonsComponent implements OnInit {
    constructor(private dialog: DialogComponent) {}

    ngOnInit(): void {}

    openConstants(): void {
        this.dialog.openConstantsDialog();
    }
}
