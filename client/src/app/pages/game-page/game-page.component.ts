import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    public playerName: string;

    constructor(private activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.playerName = this.activatedRoute.snapshot.params['playerName'];
    }
}
