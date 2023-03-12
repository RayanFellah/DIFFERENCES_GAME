import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConstantsDialogComponent } from '@app/components/constants-dialog/constants-dialog.component';
import { ImageDialogComponent } from '@app/components/image-dialog/image-dialog.component';
import { LoadingDialogComponent } from '@app/components/loading-dialog/loading-dialog.component';
import { HEIGHT, WIDTH } from 'src/constants';

@Component({
    selector: 'app-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent {
    constructor(private dialog: MatDialog) {}

    openImageDialog(imageUrl: string): void {
        this.dialog.open(ImageDialogComponent, {
            data: { imageUrl },
            maxWidth: WIDTH,
            maxHeight: HEIGHT,
        });
    }
    openConstantsDialog(): void {
        this.dialog.open(ConstantsDialogComponent, { data: {}, panelClass: 'custom-modalbox' });
    }

    openLoadingDialog(): void {
        this.dialog.open(LoadingDialogComponent, { data: {}, panelClass: 'custom-modalbox' });
    }
}
