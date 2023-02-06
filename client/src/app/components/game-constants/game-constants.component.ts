import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-game-constants',
    templateUrl: './game-constants.component.html',
    styleUrls: ['./game-constants.component.scss'],
})
export class GameConstantsComponent implements OnInit {
    constructor(@Inject(MAT_DIALOG_DATA) public data: { gameTime: number; penaltyTime: number; savedTime: number }) {}

    ngOnInit(): void {}
}
