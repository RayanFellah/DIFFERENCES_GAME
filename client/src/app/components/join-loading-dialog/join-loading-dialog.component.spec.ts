import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogService } from '@app/services/dialog-service/dialog.service';
import { JoinLoadingDialogComponent } from './join-loading-dialog.component';

describe('JoinLoadingDialogComponent', () => {
    let component: JoinLoadingDialogComponent;
    let fixture: ComponentFixture<JoinLoadingDialogComponent>;
    let dialogService: DialogService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JoinLoadingDialogComponent],
            providers: [DialogService],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JoinLoadingDialogComponent);
        component = fixture.componentInstance;
        dialogService = TestBed.inject(DialogService);
        spyOn(dialogService, 'emitJoinCancellation').and.callFake(() => {});
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit join cancellation', () => {
        component.cancelJoin();
        expect(dialogService.emitJoinCancellation).toHaveBeenCalled();
    });
});
