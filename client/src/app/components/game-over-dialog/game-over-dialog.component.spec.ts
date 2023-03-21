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
        expect(message).toContain('You found all the differences!');
    });

    it('should display the provided data in the dialog title', () => {
        const title = fixture.nativeElement.querySelector('h2').textContent;
        expect(title).toContain('Test data');
    });
});
