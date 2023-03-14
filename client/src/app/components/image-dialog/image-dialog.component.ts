import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-image-dialog',
    templateUrl: './image-dialog.component.html',
    styleUrls: ['./image-dialog.component.scss'],
})
export class ImageDialogComponent {
    imageUrl: SafeUrl;
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { imageUrl: string },
        private sanitizer: DomSanitizer,
        public dialogRef: MatDialogRef<ImageDialogComponent>,
    ) {
        this.imageUrl = this.sanitizer.bypassSecurityTrustUrl('data:image/bmp;base64,' + data.imageUrl);
    }
}
