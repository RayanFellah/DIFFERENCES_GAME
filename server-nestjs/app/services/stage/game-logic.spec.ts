import { StopWatch } from '@app/controllers/chronometer/stopwatch.component';
import { PlayerHandler } from '@app/controllers/player/player.component';
import { Difference } from '../difference/difference.service';
import { DifferenceDetector } from '../differences-detector/differences-detector.service';
import { ImageService } from '../Image-service/image.service';
import { MouseHandlerService } from '../mouse-handler/mouse-handler.service';
import { GameLogicService } from './game-logic.service';
const Jimp = require('jimp');

describe('Testing the GameLogic module', () => {
    let detector: DifferenceDetector;
    let clustersStub1 = new Difference([
        { posX: 0, posY: 0 },
        { posX: 0, posY: 1 },
        { posX: 0, posY: 2 },
    ]);
    let clustersStub2 = new Difference([
        { posX: 4, posY: 3 },
        { posX: 4, posY: 4 },
        { posX: 4, posY: 5 },
    ]);
    let clustersStub = [clustersStub1, clustersStub2];
    let gameLogic: GameLogicService;
    let path1Stub: string = 'app/services/Image-service/imageStubs/img1.png';
    let path2Stub: string = 'app/services/Image-service/imageStubs/img2.png';
    let playerNameStub = 'test';

    beforeEach(async () => {
        let player = new PlayerHandler(playerNameStub);
        detector = new DifferenceDetector(new ImageService(path1Stub), new ImageService(path2Stub));
        gameLogic = new GameLogicService(path1Stub, path2Stub, detector, 1, player.username);
    });

    it('GameLogic should be instanciated correctly', () => {
        expect(gameLogic.detector).toEqual(new DifferenceDetector(new ImageService(path1Stub), new ImageService(path2Stub)));
        expect(gameLogic.player).toEqual(new PlayerHandler(playerNameStub));
        expect(gameLogic.stopWatch).toEqual(new StopWatch());
        expect(gameLogic.mouseService).toEqual(new MouseHandlerService());
        expect(gameLogic.enlargingRadius).toEqual(1);
    });
    it('removeDifference to remove the difference from list', () => {
        gameLogic.removeDifference(clustersStub2);
        expect(clustersStub.length).toEqual(1);
        expect(clustersStub).not.toContain(clustersStub2);
    });
    it('isDone should return False when differencesLeft is not equal to 0', () => {
        let fakeDifferencesLeft = 1;
        gameLogic.differencesLeft = fakeDifferencesLeft;
        gameLogic.isDone();
        expect(gameLogic.isDone).toBeFalsy();
    });
    it('isDone should return True when differencesLeft is equal to 0', () => {
        let fakeDifferencesLeft = 0;
        gameLogic.differencesLeft = fakeDifferencesLeft;
        gameLogic.isDone();
        expect(gameLogic.isDone).toBeTruthy();
    });
    it('expect stop to be called when differencesLeft is equal to 0', () => {
        const stopWatchStopSpy = jest.spyOn(gameLogic.stopWatch, 'stop').mockImplementationOnce(() => {});
        gameLogic.isDone();
        expect(stopWatchStopSpy).toHaveBeenCalled();
    });
    it('handleClick should return undefined is isDone is true', () => {
        const spyIsDone = jest.spyOn(gameLogic, 'isDone').mockImplementationOnce(() => {
            return true;
        });
        gameLogic.handleClick(
            new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
            }),
        );
        expect(spyIsDone).toHaveBeenCalled();
        expect(gameLogic.handleClick).toBeUndefined();
    });
    it('handleClick should return undefined when no difference is found', () => {
        const spyIsDone = jest.spyOn(gameLogic, 'isDone').mockImplementationOnce(() => {
            return false;
        });
        const spyOnMouseClick = jest.spyOn(gameLogic.mouseService, 'onMouseClick').mockImplementationOnce(() => {
            return undefined;
        });
        gameLogic.handleClick(
            new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
            }),
        );
        expect(spyIsDone).toHaveBeenCalled();
        expect(gameLogic.handleClick).toBeUndefined();
    });
    it('handleClick should decrement the differencesLeft if a difference is found', () => {
        const spyIsDone = jest.spyOn(gameLogic, 'isDone').mockImplementationOnce(() => {
            return false;
        });
        const spyOnMouseClick = jest.spyOn(gameLogic.mouseService, 'onMouseClick').mockImplementationOnce(() => {
            return clustersStub1;
        });
        const spyRemoveDifference = jest.spyOn(gameLogic, 'removeDifference').mockImplementationOnce(() => {});
        const differencesLeftBeforeClick = gameLogic.differencesLeft;
        gameLogic.handleClick(
            new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
            }),
        );
        expect(spyIsDone).toHaveBeenCalled();
        expect(spyOnMouseClick).toHaveBeenCalled();
        expect(gameLogic.differencesLeft).toEqual(differencesLeftBeforeClick - 1);
        expect(spyRemoveDifference).toHaveBeenCalled();
    });
});
