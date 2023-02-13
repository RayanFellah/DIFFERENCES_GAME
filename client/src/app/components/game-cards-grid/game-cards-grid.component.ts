import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
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
    length = 0;
    selectedGame: string;
    gameSheets: Sheet[] = [];
    sheetsImage: string[];
    gridGameSheets = this.gameSheets;
    imagePaths: SafeUrl[] = [];
    constructor(private readonly http: HttpService, private sanitizer: DomSanitizer) {}

    ngOnInit() {
        this.gridGameSheets = this.gameSheets.slice(this.gridIndexStart, this.gridIndexEnd);
        this.http.getAllSheets().subscribe((res) => {
            this.gameSheets = res;
            for (const sheet of this.gameSheets) {
                this.http.getImage(sheet, true).subscribe((resp: Blob) => {
                    const blob = new Blob([resp], { type: 'image/bmp' });
                    // sheet.originalImagePath = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob)) as SafeUrl;
                    this.imagePaths.push(this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob)) as SafeUrl);
                });
            }
            this.length = this.gameSheets.length;
        });
    }

    nextGrid() {
        console.log(this.gameSheets.length);
        if (this.gridIndexEnd - 4 < this.length) {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendSheet(event: any) {
        console.log(this.gameSheets[event.id]);
        console.log(event.id);
        this.http.sendPlaySheet(this.gameSheets[event.id]).subscribe((res) => console.log(res));
    }
}
