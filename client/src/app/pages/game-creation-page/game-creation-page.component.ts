import { Component } from '@angular/core';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent {
    windowSize = { width: window.innerWidth, height: window.innerHeight };
    get width() {
        return this.windowSize.width;
    }

    get height() {
        return this.windowSize.height;
    }
}
