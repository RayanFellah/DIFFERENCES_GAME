import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ImageUploaderService } from '@app/services/image-uploader.service';
@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent {
    file: File;
    fileName = '';
    fontSizePx = 3;
    gameTitle = new FormControl('');
    constructor(private readonly imageUploader: ImageUploaderService) {}
    get childFile() {
        return this.file;
    }
    uploadImage(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.files != null && target.files.length > 0) {
            this.file = target.files[0];
        }
    }
    verifyDifferences() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.imageUploader.upload('', this.fontSizePx, false).subscribe((e: any) => {
            if (typeof e === 'object') {
                alert(e.differences);
            }
        });
    }
    createGame() {
        if (this.gameTitle.value)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.imageUploader.upload(this.gameTitle.value, this.fontSizePx, true).subscribe((e: any) => {
                if (typeof e === 'object') {
                    alert(e.differences);
                }
            });
    }
}
