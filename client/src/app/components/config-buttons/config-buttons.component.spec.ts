import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { GameConstantsComponent } from '../game-constants/game-constants.component';
import { ConfigButtonsComponent } from './config-buttons.component';
describe('ConfigButtonsComponent', () => {
    let component: ConfigButtonsComponent;
    let fixture: ComponentFixture<ConfigButtonsComponent>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    beforeEach(async () => {
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open', 'closeAll']);

        await TestBed.configureTestingModule({
            declarations: [ConfigButtonsComponent],
            providers: [{ provide: MatDialog, useValue: dialogSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(ConfigButtonsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open the GameConstantsComponent dialog on openDialog', () => {
        component.openDialog();
        expect(dialogSpy.open).toHaveBeenCalledWith(GameConstantsComponent, {
            data: { gameTime: 30, penaltyTime: 5, savedTime: 5 },
            panelClass: 'custom-modalbox',
        });
    });

    it('should close the GameConstantsComponent dialog on onNoClick', () => {
        component.onNoClick();
        expect(dialogSpy.closeAll).toHaveBeenCalled();
    });
});
