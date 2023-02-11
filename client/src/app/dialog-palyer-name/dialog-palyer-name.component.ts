import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
@Component({
    selector: 'app-dialog-palyer-name',
    templateUrl: './dialog-palyer-name.component.html',
    styleUrls: ['./dialog-palyer-name.component.scss'],
})
export class DialogPalyerNameComponent implements OnInit {
    @Output() closeDialog = new EventEmitter();
    @Input() selectedGame: string;

    constructor(public dialogRef: MatDialogRef<DialogPalyerNameComponent>, @Inject(MAT_DIALOG_DATA) public data: { playerName: string }) {}

    ngOnInit(): void {}

    callCloseDialog(): void {
        this.closeDialog.emit();
    }

    onNoClick() {
        this.dialogRef.close();
    }

    validatePlayerName(): any {
        let validName = !(!this.data.playerName || this.data.playerName.trim().length === 0 || /^\d+$/.test(this.data.playerName));
        if (validName) {
            this.callCloseDialog();
            return validName;
        } else {
            return alert("Le nom d'utilisateur ne peut pas être vide, ne peut pas contenir que des chiffres ou des espaces.");
        }
    }
}
