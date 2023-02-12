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
    @Input() public isConfigPage: boolean;
    public games = games;
    public gridGames = games;
    public gridIndexStart = 0;
    public gridIndexEnd = 4;
    public selectedGame: string;
    public gameSheets: Sheet[] = [];
    public sheetsImage: [{ sheetToAdd: Partial<Sheet>; image: string }] = [{ sheetToAdd: { name: 'test' }, image: '' }];
    public gridGameSheets = this.gameSheets;

    constructor(private readonly http: HttpService) {}

    ngOnInit() {
        this.gridGameSheets = this.gameSheets.slice(this.gridIndexStart, this.gridIndexEnd);
        this.http.getAllSheets().subscribe((res) => {
            this.gameSheets = res;
            for (let sheet of this.gameSheets) {
                console.log('inthe For');
                this.http.getImage(sheet.sheetId, true).subscribe((res) => {
                    let blob = new Blob([res], { type: 'image/bmp' });
                    this.sheetsImage.push({ sheetToAdd: sheet, image: URL.createObjectURL(blob) });
                });
            }
        });
        console.log('avant');
        // for (let sheet of this.gameSheets) {
        //     console.log('inthe For');
        //     this.http.getImage(sheet.sheetId, true).subscribe((res) => {
        //         this.sheetsImage.push({ sheetToAdd: sheet, image: URL.createObjectURL(res) });
        //     });
        // }
        console.log(this.sheetsImage.length);
        console.log('apres');
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

    selectGame(index: number) {
        this.selectedGame = this.gameSheets[index].name;
    }
}
