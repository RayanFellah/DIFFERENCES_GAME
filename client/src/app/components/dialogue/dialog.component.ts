/* eslint-disable no-restricted-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConstantsDialogComponent } from '@app/components/constants-dialog/constants-dialog.component';
import { GameOverDialogComponent } from '@app/components/game-over-dialog/game-over-dialog.component';
import { ImageDialogComponent } from '@app/components/image-dialog/image-dialog.component';
import { JoinLoadingDialogComponent } from '@app/components/join-loading-dialog/join-loading-dialog.component';
import { LoadingDialogComponent } from '@app/components/loading-dialog/loading-dialog.component';
import { DialogService } from '@app/services/dialog-service/dialog.service';
import { HEIGHT, WIDTH } from 'src/constants';
import { HintDialogueComponent } from '../hint-dialogue/hint-dialogue.component';
import { JoinLimitedTimeComponent } from '../join-limited-time/join-limited-time.component';

@Component({
    selector: 'app-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent {
    playerNames: string[] = [];
    private loadingDialogRef: MatDialogRef<LoadingDialogComponent>;
    private joinLoadingDialogRef: MatDialogRef<JoinLoadingDialogComponent>;
    private hintDialogRef: MatDialogRef<HintDialogueComponent>;
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
        if (this.loadingDialogRef) this.loadingDialogRef.disableClose = true;
    }
    openJoinLoadingDialog(): void {
        this.joinLoadingDialogRef = this.dialog.open(JoinLoadingDialogComponent);
        if (this.joinLoadingDialogRef) this.joinLoadingDialogRef.disableClose = true;
    }
    closeJoinLoadingDialog(): void {
        this.joinLoadingDialogRef?.close();
    }
    closeLoadingDialog(): void {
        this.loadingDialogRef.close();
    }

    openGameOverDialog(message: string): void {
        this.dialog.open(GameOverDialogComponent, { data: message, panelClass: 'custom-modalbox' });
    }

    openJoinLimitedTimeDialog(): void {
        this.dialog.open(JoinLimitedTimeComponent, {
            width: '90%',
            data: 'Le temps de réponse est écoulé',
            panelClass: 'custom-modalbox',
        });
    }
    openHintDialog(noHints: number): void {
        this.hintDialogRef = this.dialog.open(HintDialogueComponent, { data: noHints - 1, panelClass: 'custom-modalbox' });
    }
    closeHintDialog() {
        this.hintDialogRef.close();
    }
}
