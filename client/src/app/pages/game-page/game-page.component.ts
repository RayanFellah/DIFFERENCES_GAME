import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    playerName: string;
    constructor(private activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        const name = this.activatedRoute.snapshot.paramMap.get('name');
        if (!name) this.playerName = 'Anonymous';
        else this.playerName = name;
    }
}
