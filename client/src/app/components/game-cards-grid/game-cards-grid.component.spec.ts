import { ComponentFixture, TestBed } from '@angular/core/testing';

import { games } from '@common/game';
import { GameCardsGridComponent } from './game-cards-grid.component';

describe('GameCardsGridComponent', () => {
    let component: GameCardsGridComponent;
    let fixture: ComponentFixture<GameCardsGridComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCardsGridComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GameCardsGridComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a property "games" which is set to the value of games from the common module', () => {
        expect(component.games).toBeDefined();
        expect(component.games).toEqual(games);
    });

    it('should have a property "gridGames"  that is set to a slice of the games array having 0 as a start index and 4 ads an end one', () => {
        expect(component.gridGames).toBeDefined();
        expect(component.gridGames.length).toEqual(4);
        expect(component.gridGames).toEqual(games.slice(0, 4));
    });

    it('should have  a property "gridIndexStart"   set to 0', () => {
        expect(component.gridIndexStart).toEqual(0);
    });

    it('should have  a property "gridIndexEnd"   set to 4', () => {
        expect(component.gridIndexEnd).toEqual(4);
    });

    it('nextGrid() should increase gridIndexStart and gridIndexEnd by 4 and update gridGames to the new slice of games', () => {
        component.nextGrid();
        expect(component.gridIndexStart).toEqual(4);
        expect(component.gridIndexEnd).toEqual(8);
        expect(component.gridGames).toEqual(games.slice(4, 8));
    });

    it('prevGrid() should decrease gridIndexStart and gridIndexEnd a by 4 and update gridGames to the new slice of games', () => {
        component.gridIndexStart = 1;
        component.prevGrid();
        expect(component.gridIndexStart).toEqual(0);
        expect(component.gridIndexEnd).toEqual(4);
        expect(component.gridGames).toEqual(games.slice(0, 4));
    });

    it('deleteGame() should remove the game at the specified index from the games array, and update gridGames to the new slice of games', () => {
        const indexToDelete = 1;
        const defaultGamesLength = component.games.length;
        component.deleteGame(indexToDelete);
        expect(component.games.length).toEqual(defaultGamesLength - 1);
        expect(component.gridGames).toEqual(component.games.slice(component.gridIndexStart, component.gridIndexEnd));
    });

    it('playGame() should not throw an error', () => {});

    it('createMultiGame() should not throw an error', () => {});

    it('resetScores() should not throw an error', () => {});
});
