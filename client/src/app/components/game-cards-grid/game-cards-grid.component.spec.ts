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

    it('should have "gridIndexStart" and "gridIndexEnd" properties set to 0 and 4 respectively', () => {
        expect(component.gridIndexStart).toEqual(0);
        expect(component.gridIndexEnd).toEqual(4);
    });

    it('should have a property "gridGames" which is set to a slice of the games array having 0 as a default start Index and 4 as a default end Index', () => {
        expect(component.gridGames).toBeDefined();
        expect(component.gridGames.length).toEqual(4);
        expect(component.gridGames).toEqual(games.slice(0, 4));
    });

    it('nextGrid() should update gridGames to the new slice of games by increasing its start & end index by 4 ', () => {
        component.nextGrid();
        expect(component.gridIndexStart).toEqual(4);
        expect(component.gridIndexEnd).toEqual(8);
        expect(component.gridGames).toEqual(games.slice(4, 8));
    });

    it('prevGrid() should update gridGames to the new slice of games by decreasing its start & end index by 4', () => {
        component.prevGrid();
        expect(component.gridIndexStart).toEqual(0);
        expect(component.gridIndexEnd).toEqual(4);
        expect(component.gridGames).toEqual(games.slice(0, 4));
    });

    it('deleteGame(index) should remove the concerned game tile and return the updated games List ', () => {
        const indexToDelete = 1;
        const defaultGridLength = component.games.length;
        component.deleteGame(indexToDelete);
        expect(component.games.length).toEqual(defaultGridLength - 1);
        expect(component.gridGames).toEqual(component.games.slice(component.gridIndexStart, component.gridIndexEnd));
    });
});
