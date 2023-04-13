import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ResetDialogComponent } from './reset-dialog.component';

describe('ResetDialogComponent', () => {
    let component: ResetDialogComponent;
    let fixture: ComponentFixture<ResetDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ResetDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MatDialog, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ResetDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
