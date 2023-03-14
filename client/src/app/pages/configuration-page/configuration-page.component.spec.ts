import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ConfigButtonsComponent } from '@app/components/config-buttons/config-buttons.component';
import { GameCardGridComponent } from '@app/components/game-card-grid/game-card-grid.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { SheetHttpService } from '@app/services/sheet-http.service';
import { of } from 'rxjs';
import { ConfigurationPageComponent } from './configuration-page.component';

describe('ConfigurationPageComponent', () => {
    let component: ConfigurationPageComponent;
    let fixture: ComponentFixture<ConfigurationPageComponent>;
    let sheetHttpServiceSpy: jasmine.SpyObj<SheetHttpService>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;

    beforeEach(() => {
        sheetHttpServiceSpy = jasmine.createSpyObj('SheetHttpService', ['getAllSheets']);
        sheetHttpServiceSpy.getAllSheets.and.returnValue(of([]));
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open', 'closeAll']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConfigurationPageComponent, HeaderComponent, ConfigButtonsComponent, GameCardGridComponent],
            providers: [
                { provide: SheetHttpService, useValue: sheetHttpServiceSpy },
                { provide: MatDialog, useValue: dialogSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfigurationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display a header component with the page title "Configuration"', () => {
        fixture.detectChanges();

        const header = fixture.nativeElement.querySelector('app-header');

        expect(header).toBeTruthy();
        expect(header.getAttribute('pageTitle')).toBe('Configuration');
    });

    it('should display a config buttons component', () => {
        const configButtons = fixture.nativeElement.querySelector('app-config-buttons');
        expect(configButtons).toBeTruthy();
    });
});
