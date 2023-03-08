import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
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
        private router: Router, // private game: GameSelectorService, // private sheetService: SheetHttpService, // private storage: LocalStorageService,
    ) {
        this.shouldNavigate$.subscribe((shouldNavigate) => {
            if (shouldNavigate) {
                this.router.navigate(['/game', this.sheet._id]);
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
    navigate() {
        this.shouldNavigate$.next(true);
    }
    jouer() {
        this.navigate();
    }
    onDelete() {
        this.delete.emit();
    }
}
