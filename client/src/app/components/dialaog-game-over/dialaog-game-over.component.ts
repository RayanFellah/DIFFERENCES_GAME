import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-dialaog-game-over',
    templateUrl: './dialaog-game-over.component.html',
    styleUrls: ['./dialaog-game-over.component.scss'],
})
export class DialaogGameOverComponent implements OnInit {
    public dialogRef: MatDialogRef<DialaogGameOverComponent>;

    constructor(@Inject(MAT_DIALOG_DATA) public data: string) {}

    ngOnInit(): void {}

    onClose() {
        this.dialogRef.close();
    }
}
