import { Component, OnInit } from '@angular/core';
// import {GamePlay} from '@common/game-play'
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { History } from '@common/history';

enum GameMode {
    ClassicSolo = 'ClassicSolo',
    LimitedTimeSolo = 'LimitedTimeSolo',
    Classic1V1 = 'Classic1V1',
    LimitedTime1V1 = 'LimitedTime1V1',
}

export interface HistoryDocument {
    gameStart: string;
    duration: string;
    gameMode: GameMode;
    player1: string;
    winner1: boolean;
    gaveUp1: boolean;
    player2: string;
    winner2: boolean;
    gaveUp2: boolean;
}
@Component({
    selector: 'app-game-history',
    templateUrl: './game-history.component.html',
    styleUrls: ['./game-history.component.scss'],
})
export class GameHistoryComponent implements OnInit {
    gameModeHistory: string;
    gamesHistory: History[] = [];

    constructor(private socketService: SocketClientService, public dialogRef: MatDialogRef<GameHistoryComponent>, public dialog: MatDialog) {}

    ngOnInit(): void {
        if (!this.socketService.isSocketAlive()) this.socketService.connect();
        this.socketService.send('get_all_History');
        this.socketService.on('history_received', (historyDocument: HistoryDocument) => {
            this.gamesHistory.unshift({
                gameStart: historyDocument.gameStart,
                duration: historyDocument.duration,
                gameMode: historyDocument.gameMode,
                player1: historyDocument.player1,
                winner1: historyDocument.winner1,
                gaveUp1: historyDocument.gaveUp1,
                player2: historyDocument.player2,
                winner2: historyDocument.winner2,
                gaveUp2: historyDocument.gaveUp2,
            });
        });

        this.socketService.on<HistoryDocument[]>('all_history_received', (historyDocuments: HistoryDocument[]) => {
            for (const historyDocument of historyDocuments) {
                this.gamesHistory.unshift({
                    gameStart: historyDocument.gameStart,

                    duration: historyDocument.duration,
                    gameMode: historyDocument.gameMode,
                    player1: historyDocument.player1,
                    winner1: historyDocument.winner1,
                    gaveUp1: historyDocument.gaveUp1,
                    player2: historyDocument.player2,
                    winner2: historyDocument.winner2,
                    gaveUp2: historyDocument.gaveUp2,
                });
            }
        });
    }

    closeDialog() {
        this.dialogRef.close();
    }

    resetHistory() {
        this.gamesHistory = [];
        this.socketService.send('reset_history');
    }
}
