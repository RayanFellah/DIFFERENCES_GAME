import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DialogPalyerNameComponent } from './dialog-palyer-name.component';

describe('DialogPalyerNameComponent', () => {
    let component: DialogPalyerNameComponent;
    let fixture: ComponentFixture<DialogPalyerNameComponent>;

    const matDialogRefMock = {
        close: jasmine.createSpy('close'),
    };

    const routerMock = {
        navigate: jasmine.createSpy('navigate'),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DialogPalyerNameComponent],
            providers: [
                { provide: MatDialogRef, useValue: matDialogRefMock },
                { provide: Router, useValue: routerMock },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: { playerName: 'Test Player Name' },
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DialogPalyerNameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should close the dialog when "No" button is clicked', () => {
        component.onNoClick();
        expect(matDialogRefMock.close).toHaveBeenCalled();
    });

    it('should validate player name and navigate to game route when valid name is provided', () => {
        component.data.playerName = 'Valid Player Name';
        component.validatePlayerName();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/game', 'Valid Player Name']);
    });

    it('should alert error message when player name is empty or contains only spaces or digits', () => {
        component.data.playerName = '';
        spyOn(window, 'alert');
        component.validatePlayerName();
        expect(window.alert).toHaveBeenCalledWith(
            "Le nom d'utilisateur ne peut pas être vide, ne peut pas contenir que des chiffres ou des espaces.",
        );

        component.data.playerName = '    ';
        spyOn(window, 'alert');
        component.validatePlayerName();
        expect(window.alert).toHaveBeenCalledWith(
            "Le nom d'utilisateur ne peut pas être vide, ne peut pas contenir que des chiffres ou des espaces.",
        );

        component.data.playerName = '123';
        spyOn(window, 'alert');
        component.validatePlayerName();
        expect(window.alert).toHaveBeenCalledWith(
            "Le nom d'utilisateur ne peut pas être vide, ne peut pas contenir que des chiffres ou des espaces.",
        );
    });
});
