import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeLimitModeService } from '@app/services/time-limit-mode.service';
import { LimitedTimeGamePageComponent } from './limited-time-game-page.component';

describe('LimitedTimeGamePageComponent', () => {
    let component: LimitedTimeGamePageComponent;
    let fixture: ComponentFixture<LimitedTimeGamePageComponent>;
    const logicService: TimeLimitModeService = jasmine.createSpyObj('TimeLimitModeService', ['setCanvas', 'updateImagesInformation', 'sendClick']);

    beforeEach(async () => {
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
