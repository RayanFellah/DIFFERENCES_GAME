/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogComponent } from '@app/components/dialogue/dialog.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { CanvasHelperService } from '@app/services/canvas-helper.service';
import { CheatModeService } from '@app/services/cheat-mode.service';
import { GameLogicService } from '@app/services/game-logic.service';
import { GameReplayService } from '@app/services/game-replay/game-replay.service';
import { GameStateService } from '@app/services/game-state/game-state.service';
import { ImageHttpService } from '@app/services/image-http.service';
import { SheetHttpService } from '@app/services/sheet-http.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { GamePageComponent } from './game-page.component';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let canvasHelperServiceSpy: CanvasHelperService;
    let imageHttpServiceSpy: CanvasHelperService;
    let gameLogicServiceSpy: GameLogicService;
    let sheetHttpServiceSpy: SheetHttpService;
    let socketClientServiceSpy: SocketClientService;
    let cheatModeServiceSpy: CheatModeService;
    let gameStateServiceSpy: GameStateService;
    let routerSpy: Router;
    let mockDialog: MatDialog;
    let gameReplayServiceSpy: GameReplayService;
    let activatedRoute: ActivatedRoute;

    beforeEach(() => {
        mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

        canvasHelperServiceSpy = jasmine.createSpyObj('CanvasHelperService', ['getCanvas']);
        gameLogicServiceSpy = jasmine.createSpyObj('GameLogicService', ['start', 'cheat', 'sendClick']);
        imageHttpServiceSpy = jasmine.createSpyObj('ImageHttpService', ['']);
        sheetHttpServiceSpy = jasmine.createSpyObj('SheetHttpService', ['getSheet']);
        socketClientServiceSpy = jasmine.createSpyObj('SocketClientService', ['disconnect', 'on', 'send', 'socket', 'isSocketAlive']);
        cheatModeServiceSpy = jasmine.createSpyObj('CheatModeService', ['getDifferences']);
        gameStateServiceSpy = jasmine.createSpyObj('GameStateService', ['']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate', 'snapshot']);
        gameReplayServiceSpy = jasmine.createSpyObj('GameReplayService', ['events', 'resetTimer']);
        activatedRoute = jasmine.createSpyObj('ActivatedRoute', ['']);

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
                    useValue: activatedRoute,
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
                { provide: GameReplayService, useValue: gameReplayServiceSpy },
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
});
