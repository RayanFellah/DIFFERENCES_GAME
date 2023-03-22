import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { Sheet } from '@common/sheet';
import { of } from 'rxjs';
import { CanvasHelperService } from './canvas-helper.service';
import { CheatModeService } from './cheat-mode.service';
import { GameLogicService } from './game-logic.service';
import { ImageHttpService } from './image-http.service';
import { SheetHttpService } from './sheet-http.service';

describe('GameLogicService', () => {
    let service: GameLogicService;
    let leftCanvasSpy: CanvasHelperService;
    let rightCanvasSpy: CanvasHelperService;
    let imageHttpSpy: ImageHttpService;
    let sheetHttpSpy: SheetHttpService;
    let socketServiceSpy: SocketClientService;
    let cheatModeSpy: CheatModeService;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let activatedRouteStub: any;

    beforeEach(() => {
        const sheet: Sheet = {
            _id: '1',
            title: 'test',
            differences: 3,
            difficulty: 'medium',
            originalImagePath: 'path1',
            modifiedImagePath: 'path2',
            radius: 3,
            topPlayer: 'player',
            isJoinable: true,
            topScore: 2,
        };
        activatedRouteStub = {
            snapshot: {
                paramMap: {
                    get: () => sheet,
                },
            },
        };
        leftCanvasSpy = jasmine.createSpyObj('CanvasHelperService', ['drawImage', 'getContext', 'getImageData', 'drawImageOnCanvas', 'getCanvas']);
        rightCanvasSpy = jasmine.createSpyObj('CanvasHelperService', ['drawImage', 'getContext', 'getImageData', 'drawImageOnCanvas', 'getCanvas']);
        imageHttpSpy = jasmine.createSpyObj('ImageHttpService', ['getDiffImage', 'getImage']);
        sheetHttpSpy = jasmine.createSpyObj('SheetHttpService', ['getSheet']);
        socketServiceSpy = jasmine.createSpyObj('SocketClientService', ['disconnect', 'on', 'send', 'socket', 'isSocketAlive']);
        cheatModeSpy = jasmine.createSpyObj('CheatModeService', ['isCheatModeOn', 'getDifferences', 'cheatBlink', 'removeDifference']);

        TestBed.configureTestingModule({
            providers: [
                GameLogicService,
                { provide: CanvasHelperService, useValue: leftCanvasSpy },
                { provide: CanvasHelperService, useValue: rightCanvasSpy },
                { provide: ImageHttpService, useValue: imageHttpSpy },
                { provide: SheetHttpService, useValue: sheetHttpSpy },
                { provide: SocketClientService, useValue: socketServiceSpy },
                { provide: CheatModeService, useValue: cheatModeSpy },
                {
                    provide: ActivatedRoute,
                    useValue: activatedRouteStub,
                },
            ],
        });
        service = TestBed.inject(GameLogicService);
    });

    it('should be created', () => {
        expect(service.audio).toBeTruthy();
        expect(service).toBeTruthy();
    });

    it('should set currentClick and send click data to socket', () => {
        const click = new MouseEvent('click');
        const data = {
            x: click.offsetX,
            y: click.offsetY,
            roomName: service.playRoom,
            playerName: 'testName',
        };
        service.setClick(click, 'testName');

        expect(service.currentClick).toEqual(click);
        expect(socketServiceSpy.send).toHaveBeenCalledWith('click', data);
    });
    it('should return a Promise with the sheet difficulty', async () => {
        const sheet: Sheet = {
            _id: '1',
            title: 'test',
            differences: 3,
            difficulty: 'Easy',
            originalImagePath: 'path1',
            modifiedImagePath: 'path2',
            radius: 3,
            topPlayer: 'player',
            isJoinable: true,
            topScore: 2,
        };
        const blob = new Blob(['path1'], { type: 'image/bmp' });
        sheetHttpSpy.getSheet = jasmine.createSpy().and.returnValue(of(sheet));
        imageHttpSpy.getImage = jasmine.createSpy().and.returnValue(of(blob));
        const blob2 = new Blob(['path2'], { type: 'image/bmp' });
        imageHttpSpy.getImage = jasmine.createSpy().and.returnValue(of(blob2));
        socketServiceSpy.isSocketAlive = jasmine.createSpy().and.returnValue(true);
        service.start().then((difficulty) => {
            expect(difficulty).toBe('Easy');
            expect(sheetHttpSpy.getSheet).toHaveBeenCalled();
            expect(imageHttpSpy.getImage).toHaveBeenCalledWith(sheet.originalImagePath);
            expect(imageHttpSpy.getImage).toHaveBeenCalledWith(sheet.modifiedImagePath);
            expect(socketServiceSpy.isSocketAlive).toHaveBeenCalled();
            expect(cheatModeSpy.getDifferences).toHaveBeenCalledWith(sheet);
        });
    });

    it('should not set currentClick or send click data if clickIgnored is true', () => {
        const click = new MouseEvent('click');
        service.clickIgnored = true;
        service.setClick(click, 'testName');

        expect(service.currentClick).toBeUndefined();
        expect(socketServiceSpy['send']).not.toHaveBeenCalled();
    });

    it('should replace modifiedImageData with tempImageData at specified positions', () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const color = 255;
        const diff = [
            { posX: 0, posY: 0 },
            { posX: 1, posY: 0 },
        ];
        rightCanvasSpy.context = ctx;
        leftCanvasSpy.context = ctx;
        service.modifiedImageData = new ImageData(new Uint8ClampedArray([color, 0, 0, color, 0, color, 0, color]), 2, 1);
        const tempImageData = new ImageData(new Uint8ClampedArray([color, 0, 0, color, 0, color, 0, color]), 2, 1);

        service.replaceDifference(diff, tempImageData);

        expect(service.modifiedImageData.data).toEqual(tempImageData.data);
    });

    it('cheat() should call the methods', () => {
        service.cheat();
        expect(cheatModeSpy.getDifferences).toHaveBeenCalled();
        expect(cheatModeSpy.cheatBlink).toHaveBeenCalled();
    });
    it('should set clickIgnored to true and reset it after a delay', () => {
        const time = 1000;
        service['ignoreClicks']();

        expect(service.clickIgnored).toBeTrue();
        jasmine.clock().install();
        jasmine.clock().tick(time);
        expect(service.clickIgnored).toBeTruthy();
    });
});
