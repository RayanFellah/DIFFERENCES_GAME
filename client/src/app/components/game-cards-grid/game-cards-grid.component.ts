import { Component, Input, OnInit } from '@angular/core';
import { Sheet } from '@app/interfaces/sheet';
import { HttpService } from '@app/services/http.service';
import { games } from '../../../../../common/game';

@Component({
    selector: 'app-game-cards-grid',
    templateUrl: './game-cards-grid.component.html',
    styleUrls: ['./game-cards-grid.component.scss'],
})
export class GameCardsGridComponent implements OnInit {
    @Input() isConfigPage: boolean;
    games = games;
    gridGames = games;
    gridIndexStart = 0;
    gridIndexEnd = 4;
    selectedGame: string;
    gameSheets: Sheet[] = [];
    sheetsImage: string[];
    gridGameSheets = this.gameSheets;

    constructor(private readonly http: HttpService) {}

    ngOnInit() {
        this.gridGameSheets = this.gameSheets.slice(this.gridIndexStart, this.gridIndexEnd);
        this.http.getAllSheets().subscribe((res) => {
            this.gameSheets = res;
        });
    }

    nextGrid() {
        if (this.gridIndexEnd < this.games.length) {
            this.gridIndexStart += 4;
            this.gridIndexEnd += 4;
            this.gridGameSheets = this.gameSheets.slice(this.gridIndexStart, this.gridIndexEnd);
        }
    }

    prevGrid() {
        if (this.gridIndexStart > 0) {
            this.gridIndexStart -= 4;
            this.gridIndexEnd -= 4;
            this.gridGameSheets = this.gameSheets.slice(this.gridIndexStart, this.gridIndexEnd);
        }
    }

    playGame() {}

    createMultiGame() {}

    deleteGame(index: number) {
        this.gameSheets.splice(index, 1);
        this.gridGameSheets = this.gameSheets.slice(this.gridIndexStart, this.gridIndexEnd);
        console.log('delete is called');
    }

    resetScores() {}

    sendSheet(event: any) {
        console.log(this.gameSheets[event.id]);
        console.log(event.id);
        this.http.sendPlaySheet(this.gameSheets[event.id]).subscribe((res) => console.log(res));
    }
}
