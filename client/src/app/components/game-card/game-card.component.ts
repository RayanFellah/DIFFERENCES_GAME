import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ImageHttpService } from '@app/services/image-http.service';
import { Sheet } from '@common/sheet';
import { BehaviorSubject } from 'rxjs';
import { DialogComponent } from '../dialogue/dialog.component';
import { PlayerNameDialogComponent } from '../player-name-dialog/player-name-dialog.component';
@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
    providers: [DialogComponent],
})
export class GameCardComponent implements OnInit {
    @Input() sheet: Sheet;
    @Input() isConfig: boolean;
    @Output() delete = new EventEmitter<void>();
    @Input() playerName: string;
    trustedUrl: SafeUrl;
    shouldNavigate$ = new BehaviorSubject(false);

    constructor(
        private readonly imageHttp: ImageHttpService,
        private sanitizer: DomSanitizer,
        private validation: MatDialog,
        private router: Router,
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

    openValidator(): void {
        const dialogRef = this.validation.open(PlayerNameDialogComponent, { data: { playerName: this.playerName } });

        dialogRef.componentInstance.playerNameValidated.subscribe((res) => {
            if (res.canNavigate) {
                this.router.navigate(['/game', this.sheet._id]);
            }
        });
    }

    jouer() {
        this.openValidator();
    }

    onDelete() {
        this.delete.emit();
    }
}
