/* eslint-disable no-underscore-dangle */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { GameSelectorService } from '@app/services/game-selector.service';
import { ImageHttpService } from '@app/services/image-http.service';
import { Sheet } from '@common/sheet';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent implements OnInit {
    @Input() sheet: Sheet;
    @Input() isConfig: boolean;
    @Output() delete = new EventEmitter<void>();
    trustedUrl: SafeUrl;
    shouldNavigate$ = new BehaviorSubject(false);

    constructor(
        private readonly imageHttp: ImageHttpService,
        private sanitizer: DomSanitizer,
        // eslint-disable-next-line max-len
        private router: Router,
        private game: GameSelectorService, // private sheetService: SheetHttpService, // private storage: LocalStorageService,
    ) {
        this.shouldNavigate$.subscribe((shouldNavigate) => {
            if (shouldNavigate) {
                let playerName = window.prompt('What is your name?');
                if (!playerName) playerName = 'Anonymous';
                this.router.navigate(['/game', this.sheet._id, playerName]);
            }
        });
    }
    ngOnInit() {
        if (this.sheet) {
            this.imageHttp.getImage(this.sheet.originalImagePath).subscribe((blob: Blob) => {
                this.trustedUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
            });
        }
    }
    navigate(type: boolean) {
        this.game.create = type;
        this.game.currentGame = this.sheet;
        this.shouldNavigate$.next(true);
    }
    play() {
        this.navigate(true);
    }

    join() {
        this.navigate(false);
    }
    onDelete() {
        this.delete.emit();
    }
}
