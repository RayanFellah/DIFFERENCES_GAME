import { Component, OnDestroy } from '@angular/core';
import { DialogComponent } from '@app/components/dialogue/dialog.component';
import { DialogService } from '@app/services/dialog-service/dialog.service';
import { TimeLimitModeService } from '@app/services/time-limit-mode.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
    providers: [DialogComponent],
})
export class MainPageComponent implements OnDestroy {
    readonly title: string = 'LOG2990';
    test: string = 'test';

    constructor(private readonly dialog: DialogComponent, private limitedGame: TimeLimitModeService, private dialogService: DialogService) {
        this.dialogService.selectSoloLimitedTime$.subscribe((res: boolean) => {
            if (res) {
                this.limitedGame.createSolo();
                this.dialog.closeJoinLimitedTimeDialog();
            }
        });

        this.dialogService.selectCoopLimitedTime$.subscribe((res: boolean) => {
            if (res) {
                this.limitedGame.createCoop();
                this.dialog.openLoadingDialog();
            }
        });

        this.dialogService.lunchCoopGame$.subscribe((res: boolean) => {
            if (res) {
                this.dialog.closeLoadingDialog();
                this.dialog.closeJoinLimitedTimeDialog();
            }
        });
        this.dialogService.cancel$.subscribe((res: boolean) => {
            if (res) {
                this.dialog.closeLoadingDialog();
                this.dialog.closeJoinLimitedTimeDialog();
                this.limitedGame.cancelGame();
            }
        });
    }

    ngOnDestroy() {
        this.dialogService.reset();
    }
    selectGameMode() {
        const playerName = window.prompt('Entrez votre nom:');
        const validName = !(!playerName || playerName.trim().length === 0 || /^\d+$/.test(playerName));
        if (!validName) return alert("Le nom d'utilisateur ne peut pas être vide, ne peut pas contenir que des chiffres ou des espaces.");
        this.limitedGame.logPlayer(playerName);
        this.dialog.openJoinLimitedTimeDialog();
    }
}
