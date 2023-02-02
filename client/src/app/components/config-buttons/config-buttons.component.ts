import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameConstantsComponent } from '../game-constants/game-constants.component';
@Component({
    selector: 'app-config-buttons',
    templateUrl: './config-buttons.component.html',
    styleUrls: ['./config-buttons.component.scss'],
})
export class ConfigButtonsComponent implements OnInit {
    constructor(public dialog: MatDialog) {}

    ngOnInit(): void {}

    openDialog(): void {
        this.dialog.open(GameConstantsComponent, { data: { gameTime: 30, penaltyTime: 5, savedTime: 5 }, panelClass: 'custom-modalbox' });
    }

    onNoClick(): void {
        this.dialog.open(GameConstantsComponent).close();
    }
}
