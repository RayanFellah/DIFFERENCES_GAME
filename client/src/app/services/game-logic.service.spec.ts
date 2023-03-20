import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { CanvasHelperService } from './canvas-helper.service';
import { CheatModeService } from './cheat-mode.service';
import { GameLogicService } from './game-logic.service';
import { ImageHttpService } from './image-http.service';
import { SheetHttpService } from './sheet-http.service';

describe('GameLogicService', () => {
    let service: GameLogicService;
    let leftCanvasSpy: jasmine.SpyObj<CanvasHelperService>;
    let rightCanvasSpy: jasmine.SpyObj<CanvasHelperService>;
    let imageHttpSpy: jasmine.SpyObj<ImageHttpService>;
    let sheetHttpSpy: jasmine.SpyObj<SheetHttpService>;
    let socketServiceSpy: jasmine.SpyObj<SocketClientService>;
    let cheatModeSpy: jasmine.SpyObj<CheatModeService>;
    const activatedRoute: ActivatedRoute = new ActivatedRoute();

    beforeEach(() => {
        leftCanvasSpy = jasmine.createSpyObj('CanvasHelperService', ['drawImage', 'getContext', 'getImageData']);
        rightCanvasSpy = jasmine.createSpyObj('CanvasHelperService', ['drawImage', 'getContext', 'getImageData']);
        imageHttpSpy = jasmine.createSpyObj('ImageHttpService', ['getDiffImage', 'getImage']);
        sheetHttpSpy = jasmine.createSpyObj('SheetHttpService', ['getSheet']);
        socketServiceSpy = jasmine.createSpyObj('SocketClientService', ['send', 'on']);
        cheatModeSpy = jasmine.createSpyObj('CheatModeService', ['isCheatModeOn']);

        TestBed.configureTestingModule({
            providers: [
                GameLogicService,
                { provide: CanvasHelperService, useValue: leftCanvasSpy },
                { provide: CanvasHelperService, useValue: rightCanvasSpy },
                { provide: ImageHttpService, useValue: imageHttpSpy },
                { provide: SheetHttpService, useValue: sheetHttpSpy },
                { provide: SocketClientService, useValue: socketServiceSpy },
                { provide: CheatModeService, useValue: cheatModeSpy },
                { provide: ActivatedRoute, useValue: activatedRoute },
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

    it('should not set currentClick or send click data if clickIgnored is true', () => {
        const click = new MouseEvent('click');
        service.clickIgnored = true;
        service.setClick(click, 'testName');

        expect(service.currentClick).toBeUndefined();
        expect(socketServiceSpy['send']).not.toHaveBeenCalled();
    });

    it('should call sendGameDone when res.diffsLeft is falsy', () => {
        const res = {
            coords: [{ posX: 0, posY: 0 }],
            player: { socketId: '123' },
            diffsLeft: 0,
        };

        spyOn(service, 'sendGameDone');

        service.handleResponses();
        const clickFeedbackCallback = socketServiceSpy.on.calls.mostRecent().args[1];
        clickFeedbackCallback(res);

        expect(service.sendGameDone).toHaveBeenCalled();
    });
    it('should call send method of SocketClientService with gameDone and playRoom as arguments', () => {
        service.playRoom = 'test';
        service.sendGameDone();

        // Expect the send method of SocketClientService to have been called with 'gameDone' and the mock play room as arguments
        expect(socketServiceSpy['send']).toHaveBeenCalledWith('gameDone', service.playRoom);
    });

    // it('should set up the sheet, canvas and get differences', async () => {
    //     const sheetId = '123';
    //     // const roomId = 'abc';
    //     const sheet: Sheet = {
    //         _id: sheetId,
    //         title: 'Test Sheet',
    //         originalImagePath: 'original.png',
    //         modifiedImagePath: 'modified.png',
    //         difficulty: 'easy',
    //         radius: 10,
    //         topPlayer: 'Player 1',
    //         differences: 5,
    //         isJoinable: true,
    //     };
    //     // const originalImageData = new ImageData(new Uint8ClampedArray([0, 0, 0, 255]), 1, 1);

    //     // const routeSpy = spyOn(service.activatedRoute.snapshot.paramMap, 'get');
    //     // routeSpy.and.callThrough();
    //     // routeSpy.and.callFake((param: string | null) => {
    //     //     if (param === 'id') {
    //     //         return sheetId;
    //     //     } else if (param === 'roomId') {
    //     //         return roomId;
    //     //     }
    //     // });

    //     // sheetHttpSpy.getSheet.and.returnValue(of(sheet));
    //     // imageHttpSpy.getImage.withArgs(sheet.originalImagePath).and.returnValue(of(new Blob()));
    //     // imageHttpSpy.getImage.withArgs(sheet.modifiedImagePath).and.returnValue(of(new Blob()));
    //     // leftCanvasSpy.drawImageOnCanvas.and.stub();
    //     // rightCanvasSpy.drawImageOnCanvas.and.stub();
    //     // cheatModeSpy.getDifferences.and.stub();

    //     await service.start();

    //     expect(sheetHttpSpy.getSheet).toHaveBeenCalledWith(sheetId);
    //     expect(leftCanvasSpy.drawImageOnCanvas).toHaveBeenCalledOnceWith(jasmine.any(Blob));
    //     expect(rightCanvasSpy.drawImageOnCanvas).toHaveBeenCalledOnceWith(jasmine.any(Blob));
    //     expect(cheatModeSpy.getDifferences).toHaveBeenCalledWith(sheet);
    //     expect(socketServiceSpy.on).toHaveBeenCalled();
    //     expect(service.sheet).toEqual(sheet);
    //     // expect(service.numberDifferences).toEqual(sheet.differences);
    // });

    // Add more tests here for the various methods in the GameLogicService class
});
