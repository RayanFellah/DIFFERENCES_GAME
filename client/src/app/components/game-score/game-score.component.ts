import { Component, Input } from '@angular/core';
import { Score } from '@common/score';

@Component({
    selector: 'app-game-score',
    templateUrl: './game-score.component.html',
    styleUrls: ['./game-score.component.scss'],
})
export class GameScoreComponent {
    @Input() top3Solo: Score[];
    @Input() top3Multi: Score[];
    formatScores(scores: Score[]) {
        const time = 60;
        return scores.map((score) => {
            const minutes = Math.floor(score.time / time);
            const seconds = Math.floor(score.time % time).toFixed(0);
            return `${score.playerName} ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        });
    }
}
