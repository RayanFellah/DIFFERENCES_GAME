import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ImageUploaderService } from '@app/services/image-uploader.service';
import { SnackBarService } from '@app/services/snack-bar.service';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent {
    file: File;
    fileName = '';
    fontSizePx = 3;
    gameTitle = new FormControl('');
    shouldNavigate$ = new BehaviorSubject(false);
    constructor(private readonly imageUploader: ImageUploaderService, private router: Router, private snackBar: SnackBarService) {
        this.shouldNavigate$.subscribe((shouldNavigate) => {
            if (shouldNavigate) {
                this.router.navigate(['/config']);
            }
        });
    }
    get childFile() {
        return this.file;
    }
    navigate() {
        this.shouldNavigate$.next(true);
    }
    uploadImage(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.files != null && target.files.length > 0) {
            this.file = target.files[0];
        }
    }
    verifyDifferences() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.imageUploader.verifyDifferences('', this.fontSizePx, false).subscribe((e: any) => {
            if (typeof e === 'object') {
                this.snackBar.openSnackBar('Vous avez: ' + e.differences + ' différences', 'Fermer');
            }
        });
    }
    async createGame() {
        if (this.gameTitle.value) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result: any = await firstValueFrom(await this.imageUploader.createGame('ahmed3553', this.fontSizePx, true));
            if (result.differences === undefined) {
                this.snackBar.openSnackBar('il faut entre 3 et 9 différences', 'Fermer');
            } else {
                this.snackBar.openSnackBar('Jeu créé', 'Fermer');
                this.navigate();
            }
        } else {
            this.snackBar.openSnackBar('Insérer un titre', 'Fermer');
        }
    }
}
