import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { CanvasHelperService } from '@app/services/canvas-helper.service';
import { CheatModeService } from '@app/services/cheat-mode.service';
import { GameLogicService } from '@app/services/game-logic.service';
import { ImageHttpService } from '@app/services/image-http.service';
import { SheetHttpService } from '@app/services/sheet-http.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { HEIGHT, WIDTH } from 'src/constants';
import { PlayAreaComponent } from './play-area.component';

describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let activatedRouteStub;
    let canvasHelperServiceSpy: CanvasHelperService;
    let imageHttpServiceSpy: CanvasHelperService;
    let gameLogicServiceSpy: GameLogicService;
    let sheetHttpServiceSpy: SheetHttpService;
    let socketClientServiceSpy: SocketClientService;
    let cheatModeServiceSpy: CheatModeService;

    beforeEach(() => {
        activatedRouteStub = {
            snapshot: {
                paramMap: {
                    get: () => 'some-value',
                },
            },
        };

        canvasHelperServiceSpy = jasmine.createSpyObj('CanvasHelperService', ['getCanvas']);
        gameLogicServiceSpy = jasmine.createSpyObj('GameLogicService', ['start', 'cheat', 'sendClick']);
        imageHttpServiceSpy = jasmine.createSpyObj('ImageHttpService', ['']);
        sheetHttpServiceSpy = jasmine.createSpyObj('SheetHttpService', ['getSheet']);
        socketClientServiceSpy = jasmine.createSpyObj('SocketClientService', ['']);
        cheatModeServiceSpy = jasmine.createSpyObj('CheatModeService', ['getDifferences']);

        TestBed.configureTestingModule({
            declarations: [PlayAreaComponent],
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
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // it('should emit difficulty when logic is started', async () => {
    //     // spyOn(component.difficulty, 'emit');
    //     // spyOn(component.logic, 'start').and.callFake(async () => {
    //     //     return Promise.resolve('');
    //     // });
    //     // spyOn(component.logic, 'start').and.callFake(async () => {
    //     //     return Promise.resolve('');
    //     // });
    //     await component.ngAfterViewInit();
    //     expect(component.difficulty.emit).toHaveBeenCalled();
    // });

    it('should have input playerName', () => {
        expect(component.playerName).toBeUndefined();
    });

    it('should have two canvas elements', () => {
        expect(component['canvas1']).toBeDefined();
        expect(component['canvas2']).toBeDefined();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have default values', () => {
        expect(component.clickEnabled).toBeTrue();
        expect(component.room).toBeUndefined();
        expect(component['canvasSize']).toEqual({ x: WIDTH, y: HEIGHT });
    });

    it('should call GameLogicService.setClick when handleClick is called', () => {
        const event = new MouseEvent('click');
        spyOn(component.logic, 'setClick');
        component.handleClick(event);
        expect(component.logic.setClick).toHaveBeenCalledWith(event, component.playerName);
    });

    it('should call GameLogicService.cheat when blink is called', () => {
        spyOn(component.logic, 'cheat');
        component.blink();
        expect(component.logic.cheat).toHaveBeenCalled();
    });
});
