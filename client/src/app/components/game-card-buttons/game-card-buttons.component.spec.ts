import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameCardButtonsComponent } from './game-card-buttons.component';

describe('GameCardButtonsComponent', () => {
    let component: GameCardButtonsComponent;
    let fixture: ComponentFixture<GameCardButtonsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCardButtonsComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GameCardButtonsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have default values for isConfigPage', () => {
        expect(component.isConfigPage).toBeUndefined();
    });

    it('"callDeleteGame" should emit deleteGame event ', () => {
        const spy = spyOn(component.deleteGame, 'emit');
        const index = 1;
        component.callDeleteGame(index);
        expect(spy).toHaveBeenCalledWith(index);
    });

    it('"callPlayGame" should emit "playGame" event ', () => {
        const spy = spyOn(component.playGame, 'emit');
        component.callPlayGame();
        expect(spy).toHaveBeenCalled();
    });

    it('"callCreateMultiGame" should emit "createMultiGame" event', () => {
        const spy = spyOn(component.createMultiGame, 'emit');
        component.callCreateMultiGame();
        expect(spy).toHaveBeenCalled();
    });

    it('"callResetScores" should emit "resetScores" event ', () => {
        const spy = spyOn(component.resetScores, 'emit');
        component.callResetScores();
        expect(spy).toHaveBeenCalled();
    });
});
