// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { ActivatedRoute } from '@angular/router';
// import { SocketClientService } from '@app/services/socket-client/socket-client.service';
// import { ChatMessage } from '@common/chat-message';

// import { GamePageComponent } from './game-page.component';

// describe('GamePageComponent', () => {
//     let component: GamePageComponent;
//     let fixture: ComponentFixture<GamePageComponent>;
//     let socketService: SocketClientService;

//     beforeEach(async () => {
//         await TestBed.configureTestingModule({
//             declarations: [GamePageComponent],
//             providers: [
//                 {
//                     provide: ActivatedRoute,
//                     useValue: {
//                         snapshot: {
//                             paramMap: {
//                                 get: (param: string) => {
//                                     switch (param) {
//                                         case 'name': {
//                                             return 'Test Player';
//                                         }
//                                         case 'id': {
//                                             return '1234';
//                                         }
//                                         case 'roomId': {
//                                             return 'abcd';
//                                         }
//                                         default: {
//                                             return null;
//                                         }
//                                     }
//                                 },
//                             },
//                         },
//                     },
//                 },
//                 SocketClientService,
//             ],
//         }).compileComponents();
//     });

//     beforeEach(() => {
//         fixture = TestBed.createComponent(GamePageComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//         socketService = TestBed.inject(SocketClientService);
//     });

//     afterEach(() => {
//         fixture.destroy();
//     });

//     it('should create the component', () => {
//         expect(component).toBeTruthy();
//     });

//     it('should set the playerName, sheetId, and roomName properties on init', () => {
//         expect(component.playerName).toBe('Test Player');
//         expect(component.sheetId).toBe('1234');
//         expect(component.roomName).toBe('abcd');
//     });

//     it('should set the difficulty property on difficulty change', () => {
//         component.onDifficultyChange('easy');
//         expect(component.difficulty).toBe('easy');
//     });

//     it('should add chat messages to the chatMessages array and emit a roomMessage event', () => {
//         spyOn(socketService, 'send').and.callThrough();
//         const message: ChatMessage = {
//             type: 'game',
//             content: 'Test message',
//         };
//         component.sendMessage(message);
//         expect(component.chatMessages.length).toBe(1);
//         expect(component.chatMessages[0]).toBe(message);
//         expect(socketService.send).toHaveBeenCalledWith('roomMessage', { message, roomName: component.roomName });
//     });

//     it('should handle roomMessage events and add the message to the chatMessages array', () => {
//         const message: ChatMessage = {
//             type: 'opponent',
//             content: 'Test message',
//         };
//         component.handleResponses();
//         socketService.socket.emit('roomMessage', message);
//         expect(component.chatMessages.length).toBe(1);
//         expect(component.chatMessages[0]).toBe(message);
//     });

//     it('should disconnect from the socket on destroy', () => {
//         spyOn(socketService, 'disconnect');
//         component.ngOnDestroy();
//         expect(socketService.disconnect).toHaveBeenCalled();
//     });
// });
