/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConstantsDialogComponent } from '@app/components/constants-dialog/constants-dialog.component';
import { ImageDialogComponent } from '@app/components/image-dialog/image-dialog.component';
import { LoadingDialogComponent } from '@app/components/loading-dialog/loading-dialog.component';
import { DialogService } from '@app/services/dialog-service/dialog.service';
import { HEIGHT, WIDTH } from 'src/constants';

@Component({
    selector: 'app-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent {
    playerName: string = '';
    private loadingDialogRef: MatDialogRef<LoadingDialogComponent>;
    constructor(private dialog: MatDialog, private dialogService: DialogService) {
        this.dialogService.playerNames$.subscribe((playerName: string) => {
            if (this.loadingDialogRef && this.loadingDialogRef.componentInstance) {
                this.loadingDialogRef.componentInstance.data = { playerName };
            }
        });
    }

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
        this.loadingDialogRef = this.dialog.open(LoadingDialogComponent, { data: { playerName: this.playerName }, panelClass: 'custom-modalbox' });
    }
}
