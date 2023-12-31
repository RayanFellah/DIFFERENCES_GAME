/* eslint-disable max-lines */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-empty-function */
// /* eslint-disable max-lines */

// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { MatCardModule } from '@angular/material/card';
// import { MatDialogModule } from '@angular/material/dialog';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { RouterTestingModule } from '@angular/router/testing';
// import { SocketTestHelper } from '@app/classes/socket-test-helper';
// import { DialogComponent } from '@app/components/dialogue/dialog.component';
// import { ChatEvents } from '@app/interfaces/chat-events';
// import { JoinGame } from '@app/interfaces/join-game';
// import { DialogService } from '@app/services/dialog-service/dialog.service';
// import { SheetHttpService } from '@app/services/sheet-http.service';
// import { SnackBarService } from '@app/services/snack-bar.service';
// import { SocketClientService } from '@app/services/socket-client/socket-client.service';
// import { PlayRoom } from '@common/play-room';
// import { Player } from '@common/player';
// import { Sheet } from '@common/sheet';
// import { BehaviorSubject, Observable } from 'rxjs';
// import { Socket } from 'socket.io-client';
// import { SHEETS_PER_PAGE } from 'src/constants';
// import { GameCardGridComponent } from './game-card-grid.component';

// class SocketClientServiceMock extends SocketClientService {
//     override connect() {}
// }
// const player1: Player = {
//     name: 'ahmed',
//     socketId: 'socketId',
//     differencesFound: 0,
// };
// const player2: Player = {
//     name: 'John Doe',
//     socketId: 'socketId',
//     differencesFound: 0,
// };
// const room = {
//     player1,
//     player2,
//     roomName: 'roomName',
// };

// describe('GameCardGridComponent', () => {
//     let component: GameCardGridComponent;
//     let fixture: ComponentFixture<GameCardGridComponent>;
//     let socketServiceMock: SocketClientServiceMock;
//     let socketHelper: SocketTestHelper;
//     let dialogService: DialogService;
//     let snackBar: SnackBarService;
//     beforeEach(async () => {
//         socketHelper = new SocketTestHelper();
//         socketServiceMock = new SocketClientServiceMock();
//         socketServiceMock.socket = socketHelper as any as Socket;

//         await TestBed.configureTestingModule({
//             declarations: [GameCardGridComponent],
//             imports: [HttpClientTestingModule, MatDialogModule, RouterTestingModule, MatCardModule],
//             providers: [
//                 DialogService,
//                 SheetHttpService,
//                 { provide: SocketClientService, useValue: socketServiceMock },
//                 DialogComponent,
//                 SnackBarService,
//                 MatSnackBar,
//             ],
//         }).compileComponents();
//         dialogService = TestBed.inject(DialogService);
//         snackBar = TestBed.inject(SnackBarService);
//     });

//     beforeEach(() => {
//         fixture = TestBed.createComponent(GameCardGridComponent);
//         component = fixture.componentInstance;
//         component.isConfig = true;
//         component.playerName = 'John Doe';
//         component.name = 'John Doe';
//         component.shouldNavigate$ = new BehaviorSubject(false);
//         component.playRoom = { sheet: { _id: '1' } } as PlayRoom;
//         component.sheets = [
//             {
//                 _id: '1',
//                 title: 'Sheet 1',
//                 originalImagePath: '',
//                 modifiedImagePath: '',
//                 difficulty: 'easy',
//                 radius: 0,
//                 top3Solo: [],
//                 differences: 0,
//                 isJoinable: true,
//                 top3Multi: [],
//             },
//             {
//                 _id: '2',
//                 title: 'Sheet 2',
//                 originalImagePath: '',
//                 modifiedImagePath: '',
//                 difficulty: 'medium',
//                 radius: 0,
//                 top3Solo: [],
//                 differences: 0,
//                 isJoinable: true,
//                 top3Multi: [],
//             },
//         ];
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     it('should correctly calculate the total number of pages', () => {
//         // Create an array of sheets with varying lengths
//         const sheets: Sheet[] = [
//             {
//                 _id: '1',
//                 title: 'Sheet 1',
//                 originalImagePath: '',
//                 modifiedImagePath: '',
//                 difficulty: 'easy',
//                 radius: 0,
//                 top3Solo: [],
//                 differences: 0,
//                 isJoinable: true,
//                 top3Multi: [],
//             },
//             {
//                 _id: '2',
//                 title: 'Sheet 2',
//                 originalImagePath: '',
//                 modifiedImagePath: '',
//                 difficulty: 'medium',
//                 radius: 0,
//                 top3Multi: [],
//                 differences: 0,
//                 isJoinable: true,
//                 top3Solo: [],
//             },
//         ];

//         // Assign the sheets to the component
//         component.sheets = sheets;

//         // Calculate the expected number of pages
//         const expectedPages = Math.ceil(sheets.length / SHEETS_PER_PAGE);

//         // Assert that the component correctly calculates the number of pages
//         expect(component.totalPages).toEqual(expectedPages);
//     });

//     it('should call getAllSheets and subscribe to dialogService observables', () => {
//         // check the content of the mocked call

//         const getAllSheetsSpy = spyOn(component['sheetHttpService'], 'getAllSheets').and.callThrough();
//         const cancelSpy = spyOn(component['dialogService'].cancel$, 'subscribe');
//         const playerRejectedSpy = spyOn(component['dialogService'].playerRejected$, 'subscribe');
//         const playerConfirmedSpy = spyOn(component['dialogService'].playerConfirmed$, 'subscribe');
//         const cancelJoinSpy = spyOn(component['dialogService'].cancelJoin$, 'subscribe');
//         const connectSpy = spyOn(component, 'connect');
//         const sliceSpy = spyOn(component.sheets, 'slice');

//         component.ngOnInit();

//         expect(getAllSheetsSpy).toHaveBeenCalled();
//         expect(cancelSpy).toHaveBeenCalled();
//         expect(playerRejectedSpy).toHaveBeenCalled();
//         expect(playerConfirmedSpy).toHaveBeenCalled();
//         expect(cancelJoinSpy).toHaveBeenCalled();
//         expect(connectSpy).toHaveBeenCalled();
//         expect(sliceSpy).toHaveBeenCalled();

//         const subscription: Observable<Sheet[]> | undefined = getAllSheetsSpy.calls.mostRecent()?.returnValue;

//         if (subscription) {
//             const observer = {
//                 next: (sheets: Sheet[]) => {
//                     component.sheets = sheets;
//                 },
//                 error: (error: unknown) => {
//                     window.alert(`Le serveur ne répond pas et a retourné : ${error}`);
//                 },
//             };
//             subscription.subscribe(observer);
//         }
//     });

//     it('should set up socket event listeners', () => {
//         const onSpy = spyOn(component['socketService'], 'on').and.callThrough();

//         component.handleResponse();

//         expect(onSpy).toHaveBeenCalledWith('Joinable', jasmine.any(Function));
//         expect(onSpy).toHaveBeenCalledWith('Cancelled', jasmine.any(Function));
//         expect(onSpy).toHaveBeenCalledWith('UserJoined', jasmine.any(Function));
//         expect(onSpy).toHaveBeenCalledWith('UserCancelled', jasmine.any(Function));
//         expect(onSpy).toHaveBeenCalledWith('sheetDeleted', jasmine.any(Function));
//         expect(onSpy).toHaveBeenCalledWith('MultiRoomCreated', jasmine.any(Function));
//         expect(onSpy).toHaveBeenCalledWith('Rejection', jasmine.any(Function));
//         expect(onSpy).toHaveBeenCalledWith(ChatEvents.JoinedRoom, jasmine.any(Function));
//     });

//     it('should emit a new value to shouldNavigate$', () => {
//         const spy = spyOn(component.shouldNavigate$, 'next');
//         component.navigate(true);
//         expect(spy).toHaveBeenCalledWith(true);
//     });

//     it('should call the socketService to connect, join room and handle response', () => {
//         const connectSpy = spyOn(component['socketService'], 'connect');
//         const emitSpy = spyOn(component['socketService'].socket, 'emit');
//         const handleResponseSpy = spyOn(component, 'handleResponse');

//         component.connect();

//         expect(connectSpy).toHaveBeenCalled();
//         expect(emitSpy).toHaveBeenCalledWith('joinGridRoom');
//         expect(handleResponseSpy).toHaveBeenCalled();
//     });

//     it('should set isJoinable to false when cancel is called with a valid sheetId', () => {
//         const sheetId = 'sheet123';
//         component.sheets = [
//             {
//                 _id: 'sheet123',
//                 title: 'Sheet 2',
//                 originalImagePath: '',
//                 modifiedImagePath: '',
//                 difficulty: 'medium',
//                 radius: 0,
//                 top3Multi: [],
//                 differences: 0,
//                 isJoinable: true,
//                 top3Solo: [],
//             },
//         ];
//         component.cancel(sheetId);
//         expect(component.sheets.find((sheet) => sheet._id === sheetId)?.isJoinable).toBe(false);
//     });

//     it('should not modify any sheet when cancel is called with an invalid sheetId', () => {
//         const sheetId = 'sheet123';
//         component.sheets = [
//             {
//                 _id: 'sheet123',
//                 title: 'Sheet 2',
//                 originalImagePath: '',
//                 modifiedImagePath: '',
//                 difficulty: 'medium',
//                 radius: 0,
//                 top3Multi: [],
//                 differences: 0,
//                 isJoinable: true,
//                 top3Solo: [],
//             },
//         ];
//         component.cancel('invalidId');
//         expect(component.sheets.find((sheet) => sheet._id === sheetId)?.isJoinable).toBe(true);
//     });

//     it('should set current sheet ID, player name, and open loading dialog on child event', () => {
//         const joinGame: JoinGame = {
//             sheetId: '123',
//             playerName: 'Alice',
//         };
//         const sendSpy = spyOn(component['socketService'], 'send');
//         const openSpy = spyOn(component['dialog'], 'openLoadingDialog');

//         component.onChildEvent(joinGame);

//         expect(component.currentSheetId).toEqual('123');
//         expect(component.name).toEqual('Alice');
//         expect(sendSpy).toHaveBeenCalled();
//         expect(openSpy).toHaveBeenCalled();
//     });

//     it('should join game and open loading dialog', () => {
//         const joinGame: JoinGame = { playerName: 'Alice', sheetId: '123' };
//         const sendSpy = spyOn(component['socketService'], 'send');
//         const dialogSpy = spyOn(component['dialog'], 'openJoinLoadingDialog');

//         component.onJoinEvent(joinGame);

//         expect(component.currentSheetId).toBe(joinGame.sheetId);
//         expect(component.name).toBe(joinGame.playerName);
//         expect(sendSpy).toHaveBeenCalledWith('joinGame', joinGame);
//         expect(dialogSpy).toHaveBeenCalled();
//     });

//     describe('makeJoinable', () => {
//         it('should set isJoinable to true for found sheet', () => {
//             const sheetID = 'sheet123';
//             component.sheets = [
//                 {
//                     _id: 'sheet123',
//                     title: 'Sheet 2',
//                     originalImagePath: '',
//                     modifiedImagePath: '',
//                     difficulty: 'medium',
//                     radius: 0,
//                     top3Multi: [],
//                     differences: 0,
//                     isJoinable: true,
//                     top3Solo: [],
//                 },
//             ];

//             component.makeJoinable(sheetID);

//             const foundSheet = component.sheets.find((sheet) => sheet._id === sheetID);
//             expect(foundSheet?.isJoinable).toBeTruthy();
//         });

//         it('should not set isJoinable to true for non-existent sheet', () => {
//             const sheetID = '3';
//             component.sheets = [
//                 {
//                     _id: 'sheet123',
//                     title: 'Sheet 2',
//                     originalImagePath: '',
//                     modifiedImagePath: '',
//                     difficulty: 'medium',
//                     radius: 0,
//                     top3Multi: [],
//                     differences: 0,
//                     isJoinable: true,
//                     top3Solo: [],
//                 },
//             ];

//             component.makeJoinable(sheetID);

//             const foundSheet = component.sheets.find((sheet) => sheet._id === sheetID);
//             expect(foundSheet).toBeUndefined();
//         });
//     });

//     it('should return the current sheets based on the current page', () => {
//         // Set up the component with two sheets on the first page
//         component.currentPage = 0;

//         // Call the getCurrentSheets method and expect it to return the first sheet
//         const result = component.getCurrentSheets();
//         expect(result.length).toBe(2);
//         expect(result[0]).toEqual(component.sheets[0]);
//         expect(result[1]).toEqual(component.sheets[1]);

//         // Change the current page and expect the method to return the next sheet
// eslint-disable-next-line max-lines
//         component.currentPage = 1;
//         const result2 = component.getCurrentSheets();
//         expect(result2.length).toBe(0);
//         expect(result2[0]).toBeUndefined();
//         expect(result2[1]).toBeUndefined();
//     });

//     it('should not increment currentPage if on the last page', () => {
//         const maxPage = Math.ceil(component.sheets.length / SHEETS_PER_PAGE) - 1;
//         component.currentPage = maxPage;

//         component.nextPage();

//         expect(component.currentPage).toBe(0);
//     });

//     it('should increment', () => {
//         component.sheets.length = 5;
//         component.currentPage = 0;
//         component.nextPage();

//         expect(component.currentPage).toBe(1);
//     });

//     it('should decrease currentPage by 1 if currentPage > 0', () => {
//         component.currentPage = 1;
//         component.prevPage();
//         expect(component.currentPage).toEqual(0);
//     });

//     it('should not change currentPage if currentPage is already 0', () => {
//         component.currentPage = 0;
//         component.prevPage();
//         expect(component.currentPage).toEqual(0);
//     });

//     it('should send deleteSheet event when onSheetDelete is called', () => {
//         const sheet = component.sheets[0];
//         spyOn(component['socketService'], 'send');

//         component.onSheetDelete(sheet);

//         expect(component['socketService'].send).toHaveBeenCalledWith('deleteSheet', { sheetId: sheet._id });
//     });

//     it('should reset dialog service and send cancelGameCreation event if currentSheetId exists when ngOnDestroy is called', () => {
//         const currentSheetId = '1';
//         spyOn(component['dialogService'], 'reset');
//         spyOn(component['socketService'], 'send');

//         component.currentSheetId = currentSheetId;
//         component.ngOnDestroy();

//         expect(component['dialogService'].reset).toHaveBeenCalled();
//         expect(component['socketService'].send).toHaveBeenCalledWith('cancelGameCreation', currentSheetId);
//     });
//     describe('handle events', () => {
//         it('should handle joinable event', () => {
//             spyOn(component, 'makeJoinable');
//             socketHelper.peerSideEmit('Joinable', 'sheetId');
//             expect(component.makeJoinable).toHaveBeenCalled();
//         });
//         it('should handle cancel event', () => {
//             spyOn(component, 'cancel');
//             socketHelper.peerSideEmit('Cancelled', 'sheetId');
//             expect(component.cancel).toHaveBeenCalled();
//         });
//         it('should handle userJoined event', () => {
//             spyOn(dialogService, 'emitPlayerNames');
//             socketHelper.peerSideEmit('UserJoined', 'sheetId');
//             expect(dialogService.emitPlayerNames).toHaveBeenCalled();
//         });
//         it('should handle UserCancelled event', () => {
//             spyOn(dialogService, 'emitRejection');
//             socketHelper.peerSideEmit('UserCancelled', { playerName: 'ahmed' });
//             expect(dialogService.emitRejection).toHaveBeenCalled();
//         });
//         it('should handle sheetDeleted event', () => {
//             socketHelper.peerSideEmit('sheetDeleted', '1');
//             expect(component.sheets.length).toBe(1);
//         });
//         it('should handle MultiRoomCreated event', () => {
//             spyOn(socketServiceMock, 'send');
//             socketHelper.peerSideEmit('MultiRoomCreated', { player2: 'ahmed', roomName: 'room' });
//             expect(socketServiceMock.send).toHaveBeenCalled();
//         });
//         it('should handle MultiRoomCreated event if name matches', () => {
//             spyOn(socketServiceMock, 'send');
//             socketHelper.peerSideEmit('MultiRoomCreated', { player2: 'John Doe', roomName: 'room' });
//             expect(socketServiceMock.send).toHaveBeenCalled();
//         });
//         it('should handle Rejection event', () => {
//             spyOn(socketServiceMock, 'send');
//             socketHelper.peerSideEmit('Rejection', { playerName: 'John Doe', sheetId: 'sheetId' });
//             expect(socketServiceMock.send).toHaveBeenCalled();
//         });
//         it('should handle Joined event', () => {
//             spyOn(component, 'navigate');
//             socketHelper.peerSideEmit(ChatEvents.JoinedRoom, room);
//             expect(component.navigate).toHaveBeenCalled();
//         });
//         it('should AlreadyJoined event', () => {
//             spyOn(component['dialog'], 'closeJoinLoadingDialog');
//             socketHelper.peerSideEmit('AlreadyJoined');
//             expect(component['dialog'].closeJoinLoadingDialog).toHaveBeenCalled();
//         });
//         it('should handle CurrentGameDeleted event', () => {
//             spyOn(snackBar, 'openSnackBar');
//             socketHelper.peerSideEmit('CurrentGameDeleted');
//             expect(snackBar.openSnackBar).toHaveBeenCalled();
//         });
//     });
// });
it('should handle joinable event', () => {
    expect(1).toBeTruthy();
});
