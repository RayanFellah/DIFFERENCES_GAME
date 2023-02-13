import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
    selector: 'app-dialog-palyer-name',
    templateUrl: './dialog-palyer-name.component.html',
    styleUrls: ['./dialog-palyer-name.component.scss'],
})
export class DialogPalyerNameComponent implements OnInit {
    @Input() selectedGame: string;

    constructor(
        public dialogRef: MatDialogRef<DialogPalyerNameComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { playerName: string },
        private router: Router,
    ) {}

    ngOnInit(): void {}

    onNoClick() {
        this.dialogRef.close();
    }

    validatePlayerName(): any {
        let validName = !(!this.data.playerName || this.data.playerName.trim().length === 0 || /^\d+$/.test(this.data.playerName));
        if (validName) {
            return this.router.navigate(['/game', this.data.playerName]);
        } else {
            return alert("Le nom d'utilisateur ne peut pas être vide, ne peut pas contenir que des chiffres ou des espaces.");
        }
    }
}
