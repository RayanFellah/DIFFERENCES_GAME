import { ComponentFixture, TestBed } from '@angular/core/testing';

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
});
