import { Component } from '@angular/core';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent {
    file: File;
    fileName = '';
    get childFile() {
        return this.file;
    }
    uploadImage(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.files != null && target.files.length > 0) {
            this.file = target.files[0];
            // eslint-disable-next-line no-console
            console.log(this.file);
        }
    }
}
