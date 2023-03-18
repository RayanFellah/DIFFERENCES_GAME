import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinLoadingDialogComponent } from './join-loading-dialog.component';

describe('JoinLoadingDialogComponent', () => {
    let component: JoinLoadingDialogComponent;
    let fixture: ComponentFixture<JoinLoadingDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JoinLoadingDialogComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(JoinLoadingDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
