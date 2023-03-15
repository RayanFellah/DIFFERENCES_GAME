import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    @ViewChild(PlayAreaComponent) playArea: PlayAreaComponent;
    playerName: string;
    difficulty: string;
    constructor(private activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        const name = this.activatedRoute.snapshot.paramMap.get('name');
        if (!name) this.playerName = 'Anonymous';
        else this.playerName = name;
    }
    onDifficultyChange(eventData: string) {
        this.difficulty = eventData;
    }
}
