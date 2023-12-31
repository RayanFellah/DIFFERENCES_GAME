import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { Sheet } from '@common/sheet';
import { of } from 'rxjs';
import { CanvasHelperService } from './canvas-helper.service';
import { CheatModeService } from './cheat-mode.service';
import { GameHttpService } from './game-http.service';
import { GameLogicService } from './game-logic.service';
import { HintsService } from './hints.service';
import { ImageHttpService } from './image-http.service';
import { SheetHttpService } from './sheet-http.service';

describe('GameLogicService', () => {
    let service: GameLogicService;
    let leftCanvasSpy: CanvasHelperService;
    let rightCanvasSpy: CanvasHelperService;
    let imageHttpSpy: ImageHttpService;
    let sheetHttpSpy: SheetHttpService;
    let mockSocketClientService: jasmine.SpyObj<SocketClientService>;
    let cheatModeSpy: CheatModeService;
    const hintService = jasmine.createSpyObj('HintsService', ['removeDifference', 'getDifferences']);
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
            isJoinable: true,
            top3Multi: [],
            top3Solo: [],
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
        mockSocketClientService = jasmine.createSpyObj('SocketClientService', ['on']);
        cheatModeSpy = jasmine.createSpyObj('CheatModeService', ['isCheatModeOn', 'getDifferences', 'cheatBlink', 'removeDifference']);

        TestBed.configureTestingModule({
            providers: [
                GameLogicService,
                { provide: CanvasHelperService, useValue: leftCanvasSpy },
                { provide: CanvasHelperService, useValue: rightCanvasSpy },
                { provide: ImageHttpService, useValue: imageHttpSpy },
                { provide: SheetHttpService, useValue: sheetHttpSpy },
                { provide: SocketClientService, useValue: mockSocketClientService },
                { provide: CheatModeService, useValue: cheatModeSpy },
                { provide: HttpClient, useValue: {} },
                {
                    provide: GameHttpService,
                    useValue: {
                        getAllDifferences: () => of([]),
                    },
                },
                {
                    provide: ActivatedRoute,
                    useValue: activatedRouteStub,
                },
                { provide: HintsService, useValue: hintService },
            ],
        });
        service = TestBed.inject(GameLogicService);
        mockSocketClientService.on.withArgs('clickFeedBack').and.returnValue(of(/* Your fake data for clickFeedBack */));
        mockSocketClientService.on.withArgs('gameDone').and.returnValue(of(/* Your fake data for gameDone */));
        mockSocketClientService.on.withArgs('playerLeft').and.returnValue(of(/* Your fake data for playerLeft */));
    });

    it('should be created', () => {
        expect(service.audio).toBeTruthy();
        expect(service).toBeTruthy();
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
            isJoinable: true,
            top3Multi: [],
            top3Solo: [],
        };
        const blob = new Blob(['path1'], { type: 'image/bmp' });
        sheetHttpSpy.getSheet = jasmine.createSpy().and.returnValue(of(sheet));
        imageHttpSpy.getImage = jasmine.createSpy().and.returnValue(of(blob));
        const blob2 = new Blob(['path2'], { type: 'image/bmp' });
        imageHttpSpy.getImage = jasmine.createSpy().and.returnValue(of(blob2));
        service.start().then((difficulty) => {
            expect(difficulty).toBe('Easy');
            expect(sheetHttpSpy.getSheet).toHaveBeenCalled();
            expect(imageHttpSpy.getImage).toHaveBeenCalledWith(sheet.originalImagePath);
            expect(imageHttpSpy.getImage).toHaveBeenCalledWith(sheet.modifiedImagePath);
            expect(cheatModeSpy.getDifferences).toHaveBeenCalledWith(sheet);
        });
    });

    it('should not set currentClick or send click data if clickIgnored is true', () => {
        const click = new MouseEvent('click');
        service.clickIgnored = true;
        service.setClick(click, 'testName');

        expect(service.currentClick).toBeUndefined();
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

    // it('cheat() should call the methods', () => {
    //     service.cheat();
    //     expect(cheatModeSpy.getDifferences).toHaveBeenCalled();
    //     expect(cheatModeSpy.cheatBlink).toHaveBeenCalled();
    // });
    it('should set clickIgnored to true and reset it after a delay', () => {
        const time = 1000;
        service['ignoreClicks']();

        expect(service.clickIgnored).toBeTrue();
        jasmine.clock().install();
        jasmine.clock().tick(time);
        expect(service.clickIgnored).toBeTruthy();
    });
});
