import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeLimitModeService } from '@app/services/time-limit-mode.service';
import { LimitedTimeRoom } from '@common/limited-time-room';
import { Sheet } from '@common/sheet';
import { LimitedTimeGamePageComponent } from './limited-time-game-page.component';

describe('LimitedTimeGamePageComponent', () => {
    let component: LimitedTimeGamePageComponent;
    let fixture: ComponentFixture<LimitedTimeGamePageComponent>;
    const logicService: TimeLimitModeService = jasmine.createSpyObj('TimeLimitModeService', ['setCanvas', 'updateImagesInformation', 'sendClick']);
    let playRoom: LimitedTimeRoom;
    beforeEach(async () => {
        playRoom = {
            roomName: 'roomName',
            player1: {
                socketId: 'socketId',
                name: 'name',
                differencesFound: 0,
            },
            player2: {
                socketId: 'socketId',

                name: 'name',
                differencesFound: 0,
            },
            currentSheet: {
                _id: 'id',
                title: 'name',
                originalImagePath: 'path',
                modifiedImagePath: 'path',
                difficulty: 'difficulty',
                radius: 1,
            } as unknown as Sheet,
            isGameDone: false,
            usedSheets: [],
            timeLimit: 1,
            timeBonus: 1,
            hintsLeft: 1,
            currentDifferences: [],
            mode: 'a',
            hasStarted: true,
        };
        logicService.playRoom = playRoom;
        logicService.player = playRoom.player1;

        await TestBed.configureTestingModule({
            declarations: [LimitedTimeGamePageComponent],
            providers: [{ provide: TimeLimitModeService, useValue: logicService }],
        }).compileComponents();

        fixture = TestBed.createComponent(LimitedTimeGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
