<<<<<<< HEAD
import { Component, OnInit } from '@angular/core';
=======
import { Component, Input, OnInit } from '@angular/core';
>>>>>>> origin/configuration-view-fix
import { games } from '../../../../../common/game';

@Component({
    selector: 'app-game-cards-grid',
    templateUrl: './game-cards-grid.component.html',
    styleUrls: ['./game-cards-grid.component.scss'],
})
export class GameCardsGridComponent implements OnInit {
<<<<<<< HEAD
=======
    @Input() public isConfigPage: boolean;
>>>>>>> origin/configuration-view-fix
    public games = games;
    public gridGames = games;
    public gridIndexStart = 0;
    public gridIndexEnd = 4;

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
<<<<<<< HEAD
=======

    playGame() {}

    createMultiGame() {}

    deleteGame(index: number) {
        this.games.splice(index, 1);
        this.gridGames = this.games.slice(this.gridIndexStart, this.gridIndexEnd);
    }

    resetScores() {}
>>>>>>> origin/configuration-view-fix
}
