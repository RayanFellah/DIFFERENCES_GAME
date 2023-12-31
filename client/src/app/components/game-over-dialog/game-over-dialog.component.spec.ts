import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GameOverDialogComponent } from './game-over-dialog.component';

describe('GameOverDialogComponent', () => {
    let component: GameOverDialogComponent;
    let fixture: ComponentFixture<GameOverDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameOverDialogComponent],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: {},
                },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: 'Test data',
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameOverDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the game over message', () => {
        const message = fixture.nativeElement.querySelector('p').textContent;
        expect(message).toContain('La Partie Est Terminée.');
    });
});
