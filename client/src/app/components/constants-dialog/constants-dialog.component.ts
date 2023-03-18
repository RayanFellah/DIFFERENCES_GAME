import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
    selector: 'app-constants-dialog',
    templateUrl: './constants-dialog.component.html',
    styleUrls: ['./constants-dialog.component.scss'],
})
export class ConstantsDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: unknown) {}
}
