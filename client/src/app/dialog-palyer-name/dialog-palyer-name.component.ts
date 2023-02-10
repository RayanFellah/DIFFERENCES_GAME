import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
@Component({
    selector: 'app-dialog-palyer-name',
    templateUrl: './dialog-palyer-name.component.html',
    styleUrls: ['./dialog-palyer-name.component.scss'],
})
export class DialogPalyerNameComponent implements OnInit {
    constructor(public dialogRef: MatDialogRef<DialogPalyerNameComponent>, @Inject(MAT_DIALOG_DATA) public data: { playerName: string }) {}

    ngOnInit(): void {}

    onNoClick(): void {
        this.dialogRef.close();
    }
}
