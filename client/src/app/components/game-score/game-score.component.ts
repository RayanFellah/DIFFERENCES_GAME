import { Component } from '@angular/core';
import { scores } from '@common/score';

@Component({
    selector: 'app-game-score',
    templateUrl: './game-score.component.html',
    styleUrls: ['./game-score.component.scss'],
})
export class GameScoreComponent {
    scores = scores;

    formatScores = () => {
        const time = 60;
        return this.scores.map((score) => {
            const minutes = Math.floor(score.time / time);
            const seconds = Math.floor(score.time % time).toFixed(0);
            return `${score.playerName}  ${minutes}:${seconds} min`;
        });
    };
}
