import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
@Component({
    selector: 'app-reset-dialog',
    templateUrl: './reset-dialog.component.html',
    styleUrls: ['./reset-dialog.component.scss'],
})
export class ResetDialogComponent implements OnInit {
    constructor(public dialogRef: MatDialogRef<ResetDialogComponent>, public dialog: MatDialog, private socketService: SocketClientService) {}

    ngOnInit(): void {
        this.socketService.connect();
    }

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
}
