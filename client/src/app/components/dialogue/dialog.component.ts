/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConstantsDialogComponent } from '@app/components/constants-dialog/constants-dialog.component';
import { ImageDialogComponent } from '@app/components/image-dialog/image-dialog.component';
import { JoinLoadingDialogComponent } from '@app/components/join-loading-dialog/join-loading-dialog.component';
import { LoadingDialogComponent } from '@app/components/loading-dialog/loading-dialog.component';
import { DialogService } from '@app/services/dialog-service/dialog.service';
import { HEIGHT, WIDTH } from 'src/constants';

@Component({
    selector: 'app-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent {
    playerNames: string[] = [];
    private loadingDialogRef: MatDialogRef<LoadingDialogComponent>;
    private joinLoadingDialogRef: MatDialogRef<JoinLoadingDialogComponent>;
    constructor(private dialog: MatDialog, private dialogService: DialogService) {
        this.dialogService.playerNames$.subscribe((playerNames: string[]) => {
            if (this.loadingDialogRef && this.loadingDialogRef.componentInstance) {
                this.loadingDialogRef.componentInstance.data = { playerNames };
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
        this.loadingDialogRef = this.dialog.open(LoadingDialogComponent, { data: { playerNames: this.playerNames }, panelClass: 'custom-modalbox' });
        this.loadingDialogRef.disableClose = true;
    }
    openJoinLoadingDialog(): void {
        this.joinLoadingDialogRef = this.dialog.open(JoinLoadingDialogComponent);
        this.joinLoadingDialogRef.disableClose = true;
    }
    closeJoinLoadingDialog(): void {
        this.joinLoadingDialogRef?.close();
    }
    closeLoadingDialog(): void {
        this.loadingDialogRef.close();
    }
}
