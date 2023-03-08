import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-player-name-dialog',
    templateUrl: './player-name-dialog.component.html',
    styleUrls: ['./player-name-dialog.component.scss'],
})
export class PlayerNameDialogComponent implements OnInit {
    @Output() playerNameValidated = new EventEmitter<{ playerName: string; canNavigate: boolean }>();

    canNavigate$ = new BehaviorSubject(false);

    constructor(public dialogRef: MatDialogRef<PlayerNameDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: { playerName: string }) {}

    ngOnInit(): void {}

    onNoClick() {
        this.dialogRef.close();
    }

    validatePlayerName(): void {
        let validName = !(!this.data.playerName || this.data.playerName.trim().length === 0 || /^\d+$/.test(this.data.playerName));
        if (validName) {
            return this.playerNameValidated.emit({ playerName: this.data.playerName, canNavigate: true });
        } else {
            return alert("Le nom d'utilisateur ne peut pas être vide, ne peut pas contenir que des chiffres ou des espaces.");
        }
    }
}
