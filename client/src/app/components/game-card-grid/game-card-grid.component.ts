import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { DialogComponent } from '@app/components/dialogue/dialog.component';
import { JoinGame } from '@app/interfaces/join-game';
import { DialogService } from '@app/services/dialog-service/dialog.service';
import { SheetHttpService } from '@app/services/sheet-http.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { Sheet } from '@common/sheet';
import { SHEETS_PER_PAGE } from 'src/constants';
@Component({
    selector: 'app-game-card-grid',
    templateUrl: './game-card-grid.component.html',
    styleUrls: ['./game-card-grid.component.scss'],
    providers: [DialogComponent],
})
export class GameCardGridComponent implements OnInit, OnDestroy {
    @Output() sheets: Sheet[] = [];
    @Input() isConfig: boolean;
    @Input() playerName: string;
    currentPage = 0;
    currentSheetId: string;

    constructor(
        private readonly sheetHttpService: SheetHttpService,
        private socketService: SocketClientService,
        private readonly dialog: DialogComponent,
        private dialogService: DialogService,
    ) {}

    get totalPages(): number {
        return Math.ceil(this.sheets.length / SHEETS_PER_PAGE);
    }

    ngOnInit(): void {
        this.connect();
        this.sheetHttpService.getAllSheets().subscribe({
            next: (response) => {
                this.sheets = response;
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Le serveur ne répond pas et a retourné : ${err.message}`;
                window.alert(responseString);
            },
        });
        this.dialogService.cancel$.subscribe((isCancelled: boolean) => {
            if (isCancelled && this.currentSheetId) {
                this.socketService.send('cancelGameCreation', this.currentSheetId);
            }
        });
        this.connect();
        const startIndex = this.currentPage * SHEETS_PER_PAGE;
         this.sheets.slice(startIndex, startIndex + SHEETS_PER_PAGE);
    }

    connect() {
        this.socketService.connect();
        this.socketService.socket.emit('joinGridRoom');
        this.handleResponse();
    }
    handleResponse() {
        this.socketService.on('Joinable', (sheetId: string) => {
            this.makeJoinable(sheetId);
        });
        this.socketService.on('Cancelled', (sheetId: string) => {
            this.cancel(sheetId);
        });
         
        this.socketService.on('UserJoined', (joinGame: JoinGame) => {
            this.dialogService.emitPlayerNames(joinGame.playerName);
            console.log(joinGame.playerName);
        });
    }

    cancel(sheetId: string) {
        const foundSheet = this.sheets.find((sheet) => sheet._id === sheetId);
        if (foundSheet) {
            foundSheet.isJoinable = false;
        }
    }

    onChildEvent(sheetId: string): void {
        this.currentSheetId = sheetId;
        this.socketService.send('gameJoinable', sheetId);
        this.dialog.openLoadingDialog();
    }

    onJoinEvent(joinGame: JoinGame): void {
        this.socketService.send('joinGame', { playerName: joinGame.playerName, sheetId: joinGame.sheetId });
    }

    makeJoinable(sheetID: string) {
        const foundSheet = this.sheets.find((sheet) => sheet._id === sheetID);
        if (foundSheet) {
            foundSheet.isJoinable = true;
        }
    }

    getCurrentSheets(): Sheet[] {
        const startIndex = this.currentPage * SHEETS_PER_PAGE;
        return this.sheets.slice(startIndex, startIndex + SHEETS_PER_PAGE);
    }

    nextPage(): void {
        const maxPage = Math.ceil(this.sheets.length / SHEETS_PER_PAGE) - 1;
        if (this.currentPage < maxPage) {
            this.currentPage++;
        }
    }

    prevPage(): void {
        if (this.currentPage > 0) {
            this.currentPage--;
        }
    }

    onSheetDelete(sheet: Sheet) {
        const index = this.sheets.indexOf(sheet);
        if (index > -1) {
            console.log(index);
            this.sheets.splice(index, 1); // Remove the deleted sheet from the array
        } 
        console.log(index);

        this.sheetHttpService.deleteSheet(sheet._id).subscribe(); // Delete the sheet from the database
        
    }

    ngOnDestroy(): void {
        console.log('this.currentSheetId' + this.currentSheetId);
        if (this.currentSheetId) this.socketService.send('cancelGameCreation', this.currentSheetId);
    }
}
