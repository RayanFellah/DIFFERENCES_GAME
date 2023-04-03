import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinLimitedTimeComponent } from './join-limited-time.component';

describe('JoinLimitedTimeComponent', () => {
    let component: JoinLimitedTimeComponent;
    let fixture: ComponentFixture<JoinLimitedTimeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JoinLimitedTimeComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(JoinLimitedTimeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
