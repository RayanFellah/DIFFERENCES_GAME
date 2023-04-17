import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameStateService } from '@app/services/game-state/game-state.service';
import { TimeLimitModeService } from '@app/services/time-limit-mode.service';
import { TimeLimitPlayGroundComponent } from './time-limit-play-ground.component';

describe('TimeLimitPlayGroundComponent', () => {
    let component: TimeLimitPlayGroundComponent;
    let fixture: ComponentFixture<TimeLimitPlayGroundComponent>;
    const gameLogic = jasmine.createSpyObj('TimeLimitModeService', ['setCanvas', 'updateImagesInformation', 'sendClick']);
    const gameStateService = new GameStateService();
    const rter: RouterTestingModule = new RouterTestingModule();
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TimeLimitPlayGroundComponent],
            providers: [
                { provide: TimeLimitModeService, useValue: gameLogic },
                { provide: Router, useValue: rter },
                { provide: GameStateService, useValue: gameStateService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(TimeLimitPlayGroundComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
