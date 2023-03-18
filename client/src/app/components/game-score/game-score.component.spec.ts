import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameScoreComponent } from './game-score.component';

describe('GameScoreComponent', () => {
    let component: GameScoreComponent;
    let fixture: ComponentFixture<GameScoreComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameScoreComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameScoreComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should format scores correctly', () => {
        component.scores = [
            { playerName: 'Player 1', time: 120 },
            { playerName: 'Player 2', time: 180 },
        ];

        const formattedScores = component.formatScores();

        expect(formattedScores).toEqual(['Player 1  2:0 min', 'Player 2  3:0 min']);
    });
});
