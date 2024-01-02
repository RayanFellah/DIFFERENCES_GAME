import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConstantsDialogComponent } from '@app/components/constants-dialog/constants-dialog.component';
import { GameHistoryComponent } from '@app/components/game-history/game-history.component';
import { GameOverDialogComponent } from '@app/components/game-over-dialog/game-over-dialog.component';
import { GameScoreComponent } from '@app/components/game-score/game-score.component';
import { ImageDialogComponent } from '@app/components/image-dialog/image-dialog.component';
import { JoinLimitedTimeComponent } from '@app/components/join-limited-time/join-limited-time.component';
import { JoinLoadingDialogComponent } from '@app/components/join-loading-dialog/join-loading-dialog.component';
import { LoadingDialogComponent } from '@app/components/loading-dialog/loading-dialog.component';
import { ResetDialogComponent } from '@app/components/reset-dialog/reset-dialog.component';
import { DialogService } from '@app/services/dialog-service/dialog.service';
import { Score } from '@common/score';
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
    private joinLimitedTimeDialogRef: MatDialogRef<JoinLimitedTimeComponent>;
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

    openGameOverDialog(data: { message: string; isClassicGame: boolean }): void {
        this.dialog.open(GameOverDialogComponent, { data, panelClass: 'custom-modalbox' });
    }
    openJoinLimitedTimeDialog(): void {
        this.joinLimitedTimeDialogRef = this.dialog.open(JoinLimitedTimeComponent, {
            width: '90%',
            data: 'Le temps de réponse est écoulé',
            panelClass: 'custom-modalbox',
        });
    }

    closeJoinLimitedTimeDialog(): void {
        this.joinLimitedTimeDialogRef?.close();
    }

    openHistoryDialog(): void {
        this.dialog.open(GameHistoryComponent, { data: {}, panelClass: 'custom-modalbox' });
    }

    openScoreDialog(scores: { top3Solo: Score[]; top3Multi: Score[] }): void {
        this.dialog.open(GameScoreComponent, { data: scores, panelClass: 'custom-modalbox' });
    }

    openResetDialog(): void {
        this.dialog.open(ResetDialogComponent, { data: {}, panelClass: 'custom-modalbox' });
    }
}
