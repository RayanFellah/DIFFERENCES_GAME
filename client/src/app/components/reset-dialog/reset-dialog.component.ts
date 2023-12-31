import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { GameEvents } from '@common/game-events';
@Component({
    selector: 'app-reset-dialog',
    templateUrl: './reset-dialog.component.html',
    styleUrls: ['./reset-dialog.component.scss'],
})
export class ResetDialogComponent {
    constructor(public dialogRef: MatDialogRef<ResetDialogComponent>, public dialog: MatDialog, private socketService: SocketClientService) {}

    resetScores() {
        this.socketService.send('reset_all_scores');
    }

    clearHistory() {
        this.socketService.send('reset_history');
    }

    deleteAllSheets() {
        this.socketService.send('delete_all_sheets');
    }
    showAlert(actionConfirmed: string) {
        alert(actionConfirmed);
    }

    resetConstants() {
        const data = {
            gameTime: 30,
            gamePenalty: 5,
            gameBonus: 5,
        };
        this.socketService.send(GameEvents.UpdateConstants, data);
    }
}
