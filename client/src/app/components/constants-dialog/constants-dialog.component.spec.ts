import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConstantsDialogComponent } from './constants-dialog.component';

describe('ConstantsDialogComponent', () => {
    let component: ConstantsDialogComponent;
    let fixture: ComponentFixture<ConstantsDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConstantsDialogComponent],
            providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConstantsDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the correct game time', () => {
        component.data = { gameTime: 30, penaltyTime: 5, savedTime: 5 };
        fixture.detectChanges();
        const gameTimeElement = fixture.nativeElement.querySelector('mat-dialog-content:nth-of-type(1) span');
        expect(gameTimeElement.textContent).toContain('30 secondes');
    });

    it('should display the correct penalty time', () => {
        component.data = { gameTime: 30, penaltyTime: 5, savedTime: 5 };
        fixture.detectChanges();
        const penaltyTimeElement = fixture.nativeElement.querySelector('mat-dialog-content:nth-of-type(2) span');
        expect(penaltyTimeElement.textContent.trim()).toBe('5 secondes');
    });

    it('should display the correct saved time', () => {
        component.data = { gameTime: 30, penaltyTime: 5, savedTime: 5 };
        fixture.detectChanges();
        const savedTimeElement = fixture.nativeElement.querySelector('mat-dialog-content:nth-of-type(3) span');
        expect(savedTimeElement.textContent).toContain('5 secondes');
    });
});