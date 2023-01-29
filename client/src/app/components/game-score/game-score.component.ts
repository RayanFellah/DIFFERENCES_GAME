import { Component, OnInit } from '@angular/core';
import { scores } from '../../../../../common/score';
@Component({
    selector: 'app-game-score',
    templateUrl: './game-score.component.html',
    styleUrls: ['./game-score.component.scss'],
})
export class GameScoreComponent implements OnInit {
    public scores = scores;

    formatScores = () => {
        return this.scores.map((score) => {
            const minutes = Math.floor(score.time / 60);
            const seconds = Math.floor(score.time % 60).toFixed(0);
            return `${score.playerName}    ${minutes}:${seconds} min `;
        });
    };

    constructor() {}

    ngOnInit(): void {}
}
