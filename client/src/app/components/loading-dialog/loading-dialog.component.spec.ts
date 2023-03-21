import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogService } from '@app/services/dialog-service/dialog.service';
import { LoadingDialogComponent } from './loading-dialog.component';

describe('LoadingDialogComponent', () => {
    let component: LoadingDialogComponent;
    let fixture: ComponentFixture<LoadingDialogComponent>;
    let dialogServiceSpy: jasmine.SpyObj<DialogService>;

    beforeEach(async () => {
        const dialogService = jasmine.createSpyObj('DialogService', ['emitCancellation', 'emitRejection', 'emitConfirmation']);

        await TestBed.configureTestingModule({
            declarations: [LoadingDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: { playerNames: [] } },
                { provide: DialogService, useValue: dialogService },
            ],
        }).compileComponents();

        dialogServiceSpy = TestBed.inject(DialogService) as jasmine.SpyObj<DialogService>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LoadingDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit cancellation on cancelCreation', () => {
        component.cancelCreation();
        expect(dialogServiceSpy.emitCancellation).toHaveBeenCalled();
    });

    it('should emit rejection on reject', () => {
        const name = 'John';
        component.reject(name);
        expect(dialogServiceSpy.emitRejection).toHaveBeenCalledWith(name);
    });

    it('should emit confirmation on confirm', () => {
        const name = 'Jane';
        component.confirm(name);
        expect(dialogServiceSpy.emitConfirmation).toHaveBeenCalledWith(name);
    });
});
