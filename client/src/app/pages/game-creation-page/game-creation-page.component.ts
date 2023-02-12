import { Component } from '@angular/core';
import { ImageUploaderService } from '@app/services/image-uploader.service';
@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent {
    file: File;
    fileName = '';
    shortLink: string = '';
    fontSizePx = 3;
    constructor(private readonly imageUploader: ImageUploaderService) {}
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
    verifyDifferences() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.imageUploader.upload(this.fontSizePx, false).subscribe((e: any) => {
            if (typeof e === 'object') {
                alert(e.differences);
            }
        });
    }
    createGame() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.imageUploader.upload(this.fontSizePx, true).subscribe((e: any) => {
            if (typeof e === 'object') {
                alert(e.differences);
            }
        });
    }
}
