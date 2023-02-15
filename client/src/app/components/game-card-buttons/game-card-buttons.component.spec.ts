import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { of } from 'rxjs';
import { DialogPalyerNameComponent } from '@app/dialog-palyer-name/dialog-palyer-name.component';
import { GameCardButtonsComponent } from './game-card-buttons.component';

describe('GameCardButtonsComponent', () => {
    let component: GameCardButtonsComponent;
    let fixture: ComponentFixture<GameCardButtonsComponent>;
    let matDialog: MatDialog;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCardButtonsComponent],
            imports: [MatDialogModule],
            providers: [
                {
                    provide: MatDialog,
                    useValue: {
                        open: jasmine.createSpy('open').and.returnValue({
                            afterClosed: () => of('Test result'),
                        }),
                        closeAll: jasmine.createSpy('closeAll'),
                    },
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameCardButtonsComponent);
        component = fixture.componentInstance;
        matDialog = TestBed.inject(MatDialog);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open the dialog on sendIndex', () => {
        spyOn(matDialog, 'open').and.callThrough();
        component.sendIndex();
        expect(matDialog.open).toHaveBeenCalledWith(DialogPalyerNameComponent, { data: { name: component.playGame } });
    });

    it('should emit deleteGame event when callDeleteGame is called', () => {
        spyOn(component.deleteGame, 'emit');
        component.callDeleteGame(1);
        expect(component.deleteGame.emit).toHaveBeenCalledWith(1);
    });

    it('should emit playGame event when callPlayGame is called', () => {
        spyOn(component.playGame, 'emit');
        component.callPlayGame();
        expect(component.playGame.emit).toHaveBeenCalled();
    });

    it('should emit createMultiGame event when callCreateMultiGame is called', () => {
        spyOn(component.createMultiGame, 'emit');
        component.callCreateMultiGame();
        expect(component.createMultiGame.emit).toHaveBeenCalled();
    });

    it('should emit resetScores event when callResetScores is called', () => {
        spyOn(component.resetScores, 'emit');
        component.callResetScores();
        expect(component.resetScores.emit).toHaveBeenCalled();
    });

    it('should emit selectGame event when callSelectGame is called', () => {
        spyOn(component.selectGame, 'emit');
        component.callSelectGame(2);
        expect(component.selectGame.emit).toHaveBeenCalledWith(2);
    });

    it('should emit sendIdx event when sendIndex is called', () => {
        spyOn(component.sendIdx, 'emit');
        component.sendIndex();
        expect(component.sendIdx.emit).toHaveBeenCalledWith({ id: component.idx, message: 'I Have been clicked' });
    });

    it('should call openDialog when sendIndex is called', () => {
        spyOn(component, 'openDialog');
        component.sendIndex();
        expect(component.openDialog).toHaveBeenCalled();
    });

    it('should call closeAll when closeDialog is called', () => {
        component.closeDialog();
        expect(matDialog.closeAll).toHaveBeenCalled();
    });
});
