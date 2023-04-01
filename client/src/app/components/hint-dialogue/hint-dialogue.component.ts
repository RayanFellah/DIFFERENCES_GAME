import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-hint-dialogue',
    templateUrl: './hint-dialogue.component.html',
    styleUrls: ['./hint-dialogue.component.scss'],
})
export class HintDialogueComponent {
    noHints: number;
    constructor(@Inject(MAT_DIALOG_DATA) public data: string) {}
}
