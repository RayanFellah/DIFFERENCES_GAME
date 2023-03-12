import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, Output } from '@angular/core';
import { SheetHttpService } from '@app/services/sheet-http.service';
import { SocketService } from '@app/socket-service.service';
import { Sheet } from '@common/sheet';
import { SHEETS_PER_PAGE } from 'src/constants';

@Component({
    selector: 'app-game-card-grid',
    templateUrl: './game-card-grid.component.html',
    styleUrls: ['./game-card-grid.component.scss'],
})
export class GameCardGridComponent implements OnInit {
    @Output() sheets: Sheet[] = [];
    @Input() isConfig: boolean;
    @Input() playerName: string;
    currentPage = 0;

    constructor(private readonly sheetHttpService: SheetHttpService, public socketService: SocketService) {}

    get totalPages(): number {
        return Math.ceil(this.sheets.length / SHEETS_PER_PAGE);
    }

    ngOnInit(): void {
        this.sheetHttpService.getAllSheets().subscribe({
            next: (response) => {
                this.sheets = response;
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Le serveur ne répond pas et a retourné : ${err.message}`;
                window.alert(responseString);
            },
        });

        this.connect();
        console.log(this.socketService.socket.connected);
    }

    connect() {
        this.socketService.connect();
        this.socketService.socket.emit('joinGridRoom');
        this.handleResponse();
    }
    handleResponse() {
        this.socketService.on('Joinable', (sheetId: string) => {
            this.makeJoinable(sheetId);
            console.log('ABADWDC');
        });
    }

    onChildEvent(sheetId: string): void {
        console.log('notified, sending now to server');
        console.log(sheetId);
        this.socketService.send('gameJoinable', sheetId);
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
            this.sheets.splice(index, 1); // Remove the deleted sheet from the array
        }
        this.sheetHttpService.deleteSheet(sheet._id).subscribe(() => {}); // Delete the sheet from the database
    }
}
