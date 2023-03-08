import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
    selector: 'app-player-name-dialog',
    templateUrl: './player-name-dialog.component.html',
    styleUrls: ['./player-name-dialog.component.scss'],
})
export class PlayerNameDialogComponent implements OnInit {
    constructor(
        public dialogRef: MatDialogRef<PlayerNameDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { playerName: string },
        private router: Router,
    ) {}

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
    ngOnInit(): void {}
}
