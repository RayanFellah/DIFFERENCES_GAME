/* eslint-disable max-params */
import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { DialogComponent } from '@app/components/dialogue/dialog.component';
import { ChatEvents } from '@app/interfaces/chat-events';
import { JoinGame } from '@app/interfaces/join-game';
import { DialogService } from '@app/services/dialog-service/dialog.service';
import { GameStateService } from '@app/services/game-state/game-state.service';
import { SheetHttpService } from '@app/services/sheet-http.service';
import { SnackBarService } from '@app/services/snack-bar.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { GameConstants } from '@common/game-constants';
import { MultiRoomCreated } from '@common/multiplayer/multi-room-create';
import { RejectionEvent } from '@common/multiplayer/rejection-event';
import { PlayRoom } from '@common/play-room';
import { Sheet } from '@common/sheet';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
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
    gameConstants: GameConstants;
    name: string;
    currentPage = 0;
    currentSheetId: string;
    playRoom: PlayRoom;
    shouldNavigate$ = new BehaviorSubject(false);
    isCreator: boolean = false;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private readonly sheetHttpService: SheetHttpService,
        private socketClientService: SocketClientService,
        private dialog: DialogComponent,
        private dialogService: DialogService,
        private router: Router,
        private gameStateService: GameStateService,
        private snackBar: SnackBarService,
    ) {
        this.shouldNavigate$.subscribe((shouldNavigate) => {
            if (shouldNavigate)
                this.router.navigate(['/game', this.playRoom.sheet._id, this.name, this.playRoom.roomName, this.gameConstants.gamePenalty]);
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
        this.handleResponse();
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
                this.socketClientService.send('cancelGameCreation', this.currentSheetId);
                this.currentSheetId = '';
            }
        });
        this.dialogService.playerRejected$.subscribe((playerName: string | null) => {
            if (playerName) this.socketClientService.send('playerRejected', { playerName, sheetId: this.currentSheetId });
        });
        this.dialogService.playerConfirmed$.subscribe((playerName: string | null) => {
            if (playerName)
                this.socketClientService.send('playerConfirmed', { player1: this.name, player2: playerName, sheetId: this.currentSheetId });
        });
        this.dialogService.cancelJoin$.subscribe((isCancelled: boolean) => {
            if (isCancelled && this.currentSheetId) {
                this.socketClientService.send('cancelJoinGame', { playerName: this.name, sheetId: this.currentSheetId });
                this.currentSheetId = '';
            }
        });
        const startIndex = this.currentPage * SHEETS_PER_PAGE;
        this.sheets.slice(startIndex, startIndex + SHEETS_PER_PAGE);
        this.socketClientService.send('getConstants');
    }
    navigate(type: boolean) {
        this.shouldNavigate$.next(type);
    }

    handleResponse() {
        // Sheet created event
        this.socketClientService
            .on<Sheet>('sheetCreated')
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((sheet: Sheet) => {
                this.sheets.push(sheet);
            });

        // Sheet Joinable event
        this.socketClientService
            .on<string>('Joinable')
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((sheetId) => {
                this.makeJoinable(sheetId);
            });

        // Sheet Cancelled event
        this.socketClientService
            .on<string>('Cancelled')
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((sheetId) => {
                this.cancel(sheetId);
            });

        // User Joined event
        this.socketClientService
            .on<JoinGame>('UserJoined')
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((joinGame: JoinGame) => {
                this.dialogService.emitPlayerNames(joinGame.playerName);
            });

        // User Cancelled event
        this.socketClientService
            .on<string>('UserCancelled')
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((playerName: string) => {
                this.dialogService.emitRejection(playerName);
            });

        // Sheet Deleted event
        this.socketClientService
            .on<string>('sheetDeleted')
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((sheetId: string) => {
                if (sheetId === 'all') {
                    console.log('all sheets deleted');
                    this.sheets = [];
                    return;
                }
                const foundSheet = this.sheets.find((sheet) => sheet._id === sheetId);
                this.currentSheetId = '';
                if (foundSheet) {
                    this.sheets.splice(this.sheets.indexOf(foundSheet), 1);
                }
            });

        // MultiRoomCreated event
        this.socketClientService
            .on<MultiRoomCreated>('MultiRoomCreated')
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((res: MultiRoomCreated) => {
                if (this.name === res.player2) {
                    this.socketClientService.send('player2Joined', res);
                } else {
                    this.dialog.closeJoinLoadingDialog();
                    this.socketClientService.send('quitRoom', this.currentSheetId);
                }
            });

        // Rejection event
        this.socketClientService
            .on<RejectionEvent>('Rejection')
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((res: RejectionEvent) => {
                if (this.name === res.playerName) {
                    const sheetId = res.sheetId;
                    this.socketClientService.send('rejectionConfirmed', sheetId);
                    this.dialog.closeJoinLoadingDialog();
                }
            });

        // Joined Room event
        this.socketClientService
            .on<PlayRoom>(ChatEvents.JoinedRoom)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((room: PlayRoom) => {
                this.playRoom = room;
                if (this.name === room.player1.name) this.dialog.closeLoadingDialog();
                if (this.name === room.player2.name) this.dialog.closeJoinLoadingDialog();
                this.navigate(true);
            });

        // Already Joined event
        this.socketClientService
            .on<void>('AlreadyJoined')
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => {
                this.dialog.closeJoinLoadingDialog();
                window.alert('Ce nom est déjà utilisé pour cette partie');
            });

        // Current Game Deleted event
        this.socketClientService
            .on<void>('CurrentGameDeleted')
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => {
                if (!this.isCreator) this.dialog.closeJoinLoadingDialog();
                else this.dialog.closeLoadingDialog();
                this.snackBar.openSnackBar('La partie a été supprimée', 'OK');
            });

        // Reinitialized event
        this.socketClientService
            .on<void>('reinitialized')
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => {
                this.sheetHttpService.getAllSheets().subscribe({
                    next: (response) => {
                        this.sheets = response;
                    },
                });
            });

        // Game Constants event
        this.socketClientService
            .on<GameConstants>('gameConstants')
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((constants: GameConstants) => {
                this.gameConstants = constants;
            });
    }

    cancel(sheetId: string) {
        this.dialog.closeJoinLoadingDialog();
        const foundSheet = this.sheets.find((sheet) => sheet._id === sheetId);
        if (foundSheet) {
            foundSheet.isJoinable = false;
        }
    }

    onChildEvent(joinGame: JoinGame): void {
        this.isCreator = true;
        this.currentSheetId = joinGame.sheetId;
        this.name = joinGame.playerName;
        this.socketClientService.send('gameJoinable', joinGame);
        this.dialog.openLoadingDialog();
    }

    onJoinEvent(joinGame: JoinGame): void {
        this.isCreator = false;
        this.gameStateService.isGameInitialized = true;
        this.currentSheetId = joinGame.sheetId;
        this.name = joinGame.playerName;
        this.socketClientService.send('joinGame', joinGame);
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
        this.socketClientService.send('deleteSheet', { sheetId: sheet._id });
    }

    ngOnDestroy(): void {
        this.dialogService.reset();
        if (this.currentSheetId) this.socketClientService.send('cancelGameCreation', this.currentSheetId);
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
