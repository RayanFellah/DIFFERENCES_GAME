import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LimitedTimeGamePageComponent } from './limited-time-game-page.component';

describe('LimitedTimeGamePageComponent', () => {
    let component: LimitedTimeGamePageComponent;
    let fixture: ComponentFixture<LimitedTimeGamePageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LimitedTimeGamePageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(LimitedTimeGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
