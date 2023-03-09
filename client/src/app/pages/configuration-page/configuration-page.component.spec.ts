import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfigButtonsComponent } from '../../components/config-buttons/config-buttons.component';
import { GameCardGridComponent } from '../../components/game-card-grid/game-card-grid.component';
import { HeaderComponent } from '../../components/header/header.component';
import { ConfigurationPageComponent } from './configuration-page.component';

describe('ConfigurationPageComponent', () => {
    let component: ConfigurationPageComponent;
    let fixture: ComponentFixture<ConfigurationPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConfigurationPageComponent, HeaderComponent, ConfigButtonsComponent, GameCardGridComponent],
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
        const header = fixture.nativeElement.querySelector('app-header');
        expect(header).toBeTruthy();
        expect(header.pageTitle).toBe('Configuration');
    });

    it('should display a config buttons component', () => {
        const configButtons = fixture.nativeElement.querySelector('app-config-buttons');
        expect(configButtons).toBeTruthy();
    });

    it('should display a game card grid component with the id "grid" and isConfig set to true', () => {
        const gameCardGrid = fixture.nativeElement.querySelector('app-game-card-grid');
        expect(gameCardGrid).toBeTruthy();
        expect(gameCardGrid.id).toBe('grid');
        expect(gameCardGrid.isConfig).toBe(true);
    });
});
