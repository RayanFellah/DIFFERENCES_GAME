import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { DialogComponent } from '@app/components/dialogue/dialog.component';
import { ChatEvents } from '@app/interfaces/chat-events';
import { JoinGame } from '@app/interfaces/join-game';
import { DialogService } from '@app/services/dialog-service/dialog.service';
import { SheetHttpService } from '@app/services/sheet-http.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { PlayRoom } from '@common/play-room';
import { Sheet } from '@common/sheet';
import { BehaviorSubject } from 'rxjs';
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
    name: string;
    currentPage = 0;
    currentSheetId: string;
    playRoom: PlayRoom;
    shouldNavigate$ = new BehaviorSubject(false);
    constructor(
        private readonly sheetHttpService: SheetHttpService,
        private socketService: SocketClientService,
        private readonly dialog: DialogComponent,
        private dialogService: DialogService,
        private router: Router,
    ) {
        this.shouldNavigate$.subscribe((shouldNavigate) => {
            if (shouldNavigate) this.router.navigate(['/game', this.playRoom.sheet._id, this.name, this.playRoom.roomName]);
        });
    }

    get totalPages(): number {
        return Math.ceil(this.sheets.length / SHEETS_PER_PAGE);
    }
    @HostListener('window:beforeunload', ['$event'])
    unloadHandler() {
        this.ngOnDestroy();
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
        this.dialogService.cancel$.subscribe((isCancelled: boolean) => {
            if (isCancelled && this.currentSheetId) {
                this.socketService.send('cancelGameCreation', this.currentSheetId);
            }
        });
        this.dialogService.playerRejected$.subscribe((playerName: string) => {
            if (playerName) this.socketService.send('playerRejected', { playerName, sheetId: this.currentSheetId });
        });
        this.dialogService.playerConfirmed$.subscribe((playerName: string) => {
            if (playerName) this.socketService.send('playerConfirmed', { player1: this.name, player2: playerName, sheetId: this.currentSheetId });
        });
        this.dialogService.cancelJoin$.subscribe((isCancelled: boolean) => {
            if (isCancelled && this.currentSheetId) {
                this.socketService.send('cancelJoinGame', { playerName: this.name, sheetId: this.currentSheetId });
            }
        });
        this.connect();
    }
    navigate(type: boolean) {
        this.shouldNavigate$.next(type);
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
        });
        this.socketService.on('UserCancelled', ({ playerName }: { playerName: string }) => {
            this.dialogService.emitRejection(playerName);
        });
        this.socketService.on('sheetDeleted', (sheetId: string) => {
            const foundSheet = this.sheets.find((sheet) => sheet._id === sheetId);
            if (foundSheet) {
                this.sheets.splice(this.sheets.indexOf(foundSheet), 1);
            }
        });
        this.socketService.on('MultiRoomCreated', (res: { player2: string; roomName: string }) => {
            if (this.name === res.player2) {
                this.socketService.send('player2Joined', res);
            } else {
                this.dialog.closeJoinLoadingDialog();
                this.socketService.send('quitRoom', this.currentSheetId);
            }
        });
        this.socketService.on('Rejection', (res: { playerName: string; sheetId: string }) => {
            if (this.name === res.playerName) {
                const sheetId = res.sheetId;
                this.socketService.send('rejectionConfirmed', sheetId);
                this.dialog.closeJoinLoadingDialog();
            }
        });
        this.socketService.on(ChatEvents.JoinedRoom, (room: PlayRoom) => {
            // this.dialog.closeLoading();
            this.playRoom = room;
            if (this.name === room.player1.name) this.dialog.closeLoadingDialog();
            if (this.name === room.player2.name) this.dialog.closeJoinLoadingDialog();
            this.navigate(true);
        });
    }

    cancel(sheetId: string) {
        const foundSheet = this.sheets.find((sheet) => sheet._id === sheetId);
        if (foundSheet) {
            foundSheet.isJoinable = false;
        }
    }

    onChildEvent(joinGame: JoinGame): void {
        this.currentSheetId = joinGame.sheetId;
        this.name = joinGame.playerName;
        this.socketService.send('gameJoinable', joinGame.sheetId);
        this.dialog.openLoadingDialog();
    }

    onJoinEvent(joinGame: JoinGame): void {
        this.currentSheetId = joinGame.sheetId;
        this.name = joinGame.playerName;
        this.socketService.send('joinGame', { playerName: joinGame.playerName, sheetId: joinGame.sheetId });
        this.dialog.openJoinLoadingDialog();
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
        this.socketService.send('deleteSheet', { sheetId: sheet._id });
    }

    ngOnDestroy(): void {
        if (this.currentSheetId) this.socketService.send('cancelGameCreation', this.currentSheetId);
    }
}
