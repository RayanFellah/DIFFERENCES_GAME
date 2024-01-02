import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ConfigButtonsComponent } from './config-buttons.component';

describe('ConfigButtonsComponent', () => {
    let component: ConfigButtonsComponent;
    let fixture: ComponentFixture<ConfigButtonsComponent>;
    let mockDialog: jasmine.SpyObj<MatDialog>;

    beforeEach(() => {
        mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

        TestBed.configureTestingModule({
            declarations: [ConfigButtonsComponent],
            providers: [{ provide: MatDialog, useValue: mockDialog }],
        }).compileComponents();

        fixture = TestBed.createComponent(ConfigButtonsComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('openConstants()', () => {
        it('should open the constants dialog', () => {
            const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
            mockDialog.open.and.returnValue(dialogRefSpyObj);

            component.openConstants();

            expect(mockDialog.open).toHaveBeenCalled();
        });
    });

    describe('openHistory()', () => {
        it('should open the history dialog', () => {
            const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
            mockDialog.open.and.returnValue(dialogRefSpyObj);

            component.openHistory();

            expect(mockDialog.open).toHaveBeenCalled();
        });
    });

    describe('openReset()', () => {
        it('should open the reset dialog', () => {
            const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
            mockDialog.open.and.returnValue(dialogRefSpyObj);

            component.openReset();

            expect(mockDialog.open).toHaveBeenCalled();
        });
    });
});
