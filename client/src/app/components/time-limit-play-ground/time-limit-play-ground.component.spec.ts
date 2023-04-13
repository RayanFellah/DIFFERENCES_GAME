import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeLimitModeService } from '@app/services/time-limit-mode.service';
import { TimeLimitPlayGroundComponent } from './time-limit-play-ground.component';

describe('TimeLimitPlayGroundComponent', () => {
    let component: TimeLimitPlayGroundComponent;
    let fixture: ComponentFixture<TimeLimitPlayGroundComponent>;
    const gameLogic = jasmine.createSpyObj('TimeLimitModeService', ['setCanvas', 'updateImagesInformation', 'sendClick']);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TimeLimitPlayGroundComponent],
            providers: [{ provide: TimeLimitModeService, useValue: gameLogic }],
        }).compileComponents();

        fixture = TestBed.createComponent(TimeLimitPlayGroundComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
