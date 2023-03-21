import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogComponent } from '@app/components/dialogue/dialog.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { ChatEvents } from '@app/interfaces/chat-events';
import { CanvasHelperService } from '@app/services/canvas-helper.service';
import { CheatModeService } from '@app/services/cheat-mode.service';
import { GameLogicService } from '@app/services/game-logic.service';
import { GameStateService } from '@app/services/game-state/game-state.service';
import { ImageHttpService } from '@app/services/image-http.service';
import { SheetHttpService } from '@app/services/sheet-http.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { ChatMessage } from '@common/chat-message';
import { Player } from '@common/player';
import { GamePageComponent } from './game-page.component';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let activatedRouteStub;
    let canvasHelperServiceSpy: CanvasHelperService;
    let imageHttpServiceSpy: CanvasHelperService;
    let gameLogicServiceSpy: GameLogicService;
    let sheetHttpServiceSpy: SheetHttpService;
    let socketClientServiceSpy: SocketClientService;
    let cheatModeServiceSpy: CheatModeService;
    let gameStateServiceSpy: GameStateService;
    let routerSpy: Router;
    let mockDialog: jasmine.SpyObj<MatDialog>;
    beforeEach(() => {
        mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
        activatedRouteStub = {
            snapshot: {
                paramMap: {
                    get: () => 'test',
                },
            },
        };

        canvasHelperServiceSpy = jasmine.createSpyObj('CanvasHelperService', ['getCanvas']);
        gameLogicServiceSpy = jasmine.createSpyObj('GameLogicService', ['start', 'cheat', 'sendClick']);
        imageHttpServiceSpy = jasmine.createSpyObj('ImageHttpService', ['']);
        sheetHttpServiceSpy = jasmine.createSpyObj('SheetHttpService', ['getSheet']);
        socketClientServiceSpy = jasmine.createSpyObj('SocketClientService', ['disconnect', 'on', 'send', 'socket', 'isSocketAlive']);
        cheatModeServiceSpy = jasmine.createSpyObj('CheatModeService', ['getDifferences']);
        gameStateServiceSpy = jasmine.createSpyObj('GameStateService', ['']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate', 'snapshot']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [GamePageComponent, PlayAreaComponent, DialogComponent],
            providers: [
                {
                    provide: SocketClientService,
                    useValue: socketClientServiceSpy,
                },
                {
                    provide: ImageHttpService,
                    useValue: imageHttpServiceSpy,
                },
                {
                    provide: SheetHttpService,
                    useValue: sheetHttpServiceSpy,
                },
                {
                    provide: CanvasHelperService,
                    useValue: canvasHelperServiceSpy,
                },
                {
                    provide: CheatModeService,
                    useValue: cheatModeServiceSpy,
                },
                {
                    provide: GameLogicService,
                    useValue: gameLogicServiceSpy,
                },
                {
                    provide: ActivatedRoute,
                    useValue: activatedRouteStub,
                },
                {
                    provide: GameStateService,
                    useValue: gameStateServiceSpy,
                },
                {
                    provide: Router,
                    useValue: routerSpy,
                },
                { provide: MatDialog, useValue: mockDialog },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
    });
    afterEach(() => {
        component.ngOnDestroy();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
    it('ngOnInit should set properties correctly on initialization', () => {
        component['gameStateService'].isGameInitialized = true;
        component.ngOnInit();
        expect(component.playerName).toBe('test');
        expect(component.sheetId).toBe('test');
        expect(component.roomName).toBe('test');
        expect(component.startTime).toEqual(jasmine.any(Date));
        expect(component.timer).toBeTrue();
    });
    it('handleResponses() should add chat message to chatMessages', () => {
        const chatMessage: ChatMessage = { content: 'test', type: 'test' } as ChatMessage;
        socketClientServiceSpy.on = jasmine.createSpy().and.callFake((event, callback) => {
            if (event === 'roomMessage') {
                callback(chatMessage);
            } else {
                return;
            }
        });
        component.handleResponses();
        expect(component.chatMessages).toContain(chatMessage);
        expect(component.chatMessages[0].type).toEqual('opponent');
    });
    it('handleResponses() should set chatMessages type to game if type is game', () => {
        const chatMessage: ChatMessage = { content: 'test', type: 'game' } as ChatMessage;
        socketClientServiceSpy.on = jasmine.createSpy().and.callFake((event, callback) => {
            if (event === 'roomMessage') {
                callback(chatMessage);
            } else {
                return;
            }
        });
        component.handleResponses();
        expect(component.chatMessages[0].type).toEqual('game');
    });

    it('handleResponses() should set person and opponent based on players array', () => {
        const player1: Player = { name: 'Player 1', socketId: '1', differencesFound: 0 };
        socketClientServiceSpy.on = jasmine.createSpy().and.callFake((event, callback) => {
            callback([player1]);
        });
        component.handleResponses();
        expect(component.person).toEqual(player1);
    });
    it('handleResponses() should assign person and opponent based on players array and socketId', () => {
        const player1: Player = { name: 'Player 1', socketId: '1', differencesFound: 0 };
        const player2: Player = { name: 'Player 2', socketId: '2', differencesFound: 0 };
        socketClientServiceSpy.socket.id = '2';
        socketClientServiceSpy.on = jasmine.createSpy().and.callFake((event, callback) => {
            callback([player1, player2]);
        });
        component.handleResponses();
        expect(component.person.socketId).toEqual('2');
    });
    it('handleResponses() should assign person and opponent based on players array and socketId', () => {
        const player1: Player = { name: 'Player 1', socketId: '1', differencesFound: 0 };
        const player2: Player = { name: 'Player 2', socketId: '2', differencesFound: 0 };
        socketClientServiceSpy.socket.id = '1';
        socketClientServiceSpy.on = jasmine.createSpy().and.callFake((event, callback) => {
            callback([player1, player2]);
        });
        component.handleResponses();
        expect(component.person.socketId).toEqual('1');
    });

    it('handleResponses() should update formattedTime when receiving clock event', () => {
        const startTime = new Date('2023-03-21T00:00:00Z');
        const clockTime = new Date('2023-03-21T00:01:15Z');
        component.startTime = startTime;
        component.timer = true;
        socketClientServiceSpy.on = jasmine.createSpy().and.callFake((event, callback) => {
            if (event === ChatEvents.Clock) {
                callback(clockTime);
            } else {
                return;
            }
        });
        component.handleResponses();
        expect(component.formattedTime).toEqual('01:15');
    });
    it('handleResponses() should set person to the player if the id matches', () => {
        const player1: Player = { name: 'Player 1', socketId: '1', differencesFound: 0 };
        component.person = player1;
        socketClientServiceSpy.on = jasmine.createSpy().and.callFake((event, callback) => {
            if (event === 'foundDiff') {
                callback(player1);
            } else {
                return;
            }
        });
        component.handleResponses();
        expect(component.person).toBe(player1);
    });
    it('onDifficultyChange() should assign argument to difficulty attribute', () => {
        const difficultyEvent = 'Easy';
        component.onDifficultyChange(difficultyEvent);
        expect(component.difficulty).toEqual(difficultyEvent);
    });
    it('sendMessage() should call send and push ', () => {
        const chatMessage: ChatMessage = { content: 'test', type: 'test' } as ChatMessage;
        component.sendMessage(chatMessage);
        expect(socketClientServiceSpy.send).toHaveBeenCalled();
    });
});
