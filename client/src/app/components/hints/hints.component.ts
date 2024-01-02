import { Component } from '@angular/core';
import { HintsService } from '@app/services/hints.service';

@Component({
    selector: 'app-hints',
    templateUrl: './hints.component.html',
    styleUrls: ['./hints.component.scss'],
})
export class HintsComponent {
    constructor(public hintService: HintsService) {}
}
