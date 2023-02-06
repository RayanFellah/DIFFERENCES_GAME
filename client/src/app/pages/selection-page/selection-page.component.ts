import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-selection-page',
    templateUrl: './selection-page.component.html',
    styleUrls: ['./selection-page.component.scss'],
})
export class SelectionPageComponent implements OnInit {
    @Input() isConfigPage = false;

    constructor() {}

    ngOnInit(): void {}
}
