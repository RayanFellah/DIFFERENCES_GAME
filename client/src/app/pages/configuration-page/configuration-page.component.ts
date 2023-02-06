<<<<<<< HEAD
import { Component, OnInit } from '@angular/core';
=======
import { Component, Input, OnInit } from '@angular/core';
>>>>>>> origin/configuration-view-fix

@Component({
    selector: 'app-configuration-page',
    templateUrl: './configuration-page.component.html',
    styleUrls: ['./configuration-page.component.scss'],
})
export class ConfigurationPageComponent implements OnInit {
<<<<<<< HEAD
=======
    @Input() isConfigPage = true;
>>>>>>> origin/configuration-view-fix
    constructor() {}

    ngOnInit(): void {}
}
