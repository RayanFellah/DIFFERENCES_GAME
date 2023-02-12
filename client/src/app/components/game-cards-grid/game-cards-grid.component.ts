import { Component, Input, OnInit } from '@angular/core';
import { games } from '../../../../../common/game';

@Component({
    selector: 'app-game-cards-grid',
    templateUrl: './game-cards-grid.component.html',
    styleUrls: ['./game-cards-grid.component.scss'],
})
export class GameCardsGridComponent implements OnInit {
    @Input() public isConfigPage: boolean;
    public games = games;
    public gridGames = games;
    public gridIndexStart = 0;
    public gridIndexEnd = 4;
    public selectedGame: string;

    constructor() {}

    ngOnInit() {
        this.gridGames = this.games.slice(this.gridIndexStart, this.gridIndexEnd);
    }

    nextGrid() {
        if (this.gridIndexEnd < this.games.length) {
            this.gridIndexStart += 4;
            this.gridIndexEnd += 4;
            this.gridGames = this.games.slice(this.gridIndexStart, this.gridIndexEnd);
        }
    }

    prevGrid() {
        if (this.gridIndexStart > 0) {
            this.gridIndexStart -= 4;
            this.gridIndexEnd -= 4;
            this.gridGames = this.games.slice(this.gridIndexStart, this.gridIndexEnd);
        }
    }

    playGame() {}

    createMultiGame() {}

    deleteGame(index: number) {
        this.games.splice(index, 1);
        this.gridGames = this.games.slice(this.gridIndexStart, this.gridIndexEnd);
        console.log('delete is called');
    }

    resetScores() {}

    selectGame(index: number) {
        this.selectedGame = this.games[index].name;
    }
}
