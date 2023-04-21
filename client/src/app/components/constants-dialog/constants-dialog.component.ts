/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { GameConstants } from '@common/game-constants';
import { GameEvents } from '@common/game-events';
import { Subject, takeUntil } from 'rxjs';
import {
    GAME_TIME_LOWER_LIMIT,
    GAME_TIME_UPPER_LIMIT,
    TIME_BONUS_LOWER_LIMIT,
    TIME_BONUS_UPPER_LIMIT,
    TIME_PENALTY_LOWER_LIMIT,
    TIME_PENALTY_UPPER_LIMIT,
} from 'src/constants';
@Component({
    selector: 'app-constants-dialog',
    templateUrl: './constants-dialog.component.html',
    styleUrls: ['./constants-dialog.component.scss'],
})
export class ConstantsDialogComponent implements OnInit, OnDestroy {
    timeLimits = {
        gameTime: { lowerLimit: GAME_TIME_LOWER_LIMIT, upperLimit: GAME_TIME_UPPER_LIMIT },
        gamePenalty: { lowerLimit: TIME_PENALTY_LOWER_LIMIT, upperLimit: TIME_PENALTY_UPPER_LIMIT },
        gameBonus: { lowerLimit: TIME_BONUS_LOWER_LIMIT, upperLimit: TIME_BONUS_UPPER_LIMIT },
    };
    private gameTime = 30;
    private gamePenalty = 5;
    private gameBonus = 5;
    private unsubscribe$ = new Subject<void>();

    constructor(@Inject(MAT_DIALOG_DATA) public data: unknown, private socketClientService: SocketClientService) {}

    get gameTimeValue(): number {
        return this.gameTime;
    }
    get gamePenaltyValue(): number {
        return this.gamePenalty;
    }
    get gameBonusValue(): number {
        return this.gameBonus;
    }

    ngOnInit(): void {
        this.socketClientService.send('getConstants');
        this.handleResponse();
    }

    handleResponse() {
        this.socketClientService
            .on<GameConstants>('gameConstants')
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((data) => {
                this.gameTime = data.gameTime;
                this.gamePenalty = data.gamePenalty;
                this.gameBonus = data.gameBonus;
            });
    }

    incrementValue(attributeName: string) {
        switch (attributeName) {
            case 'gameTime':
                if (this.gameTime + 1 > this.timeLimits.gameTime.upperLimit) {
                    return;
                }
                this.gameTime++;
                break;
            case 'gamePenalty':
                if (this.gamePenalty + 1 > this.timeLimits.gamePenalty.upperLimit) return;
                this.gamePenalty++;
                break;
            case 'gameBonus':
                if (this.gameBonus + 1 > this.timeLimits.gameBonus.upperLimit) return;
                this.gameBonus++;
                break;
        }
    }
    decrementValue(attributeName: string) {
        switch (attributeName) {
            case 'gameTime':
                if (this.gameTime - 1 < this.timeLimits.gameTime.lowerLimit) return;
                this.gameTime--;
                break;
            case 'gamePenalty':
                if (this.gamePenalty - 1 < this.timeLimits.gamePenalty.lowerLimit) return;
                this.gamePenalty--;
                break;
            case 'gameBonus':
                if (this.gameBonus - 1 < this.timeLimits.gameBonus.lowerLimit) return;
                this.gameBonus--;
                break;
        }
    }
    showAlert(actionConfirmed: string) {
        alert(actionConfirmed);
    }
    saveValues() {
        const data = {
            gameTime: this.gameTime,
            gamePenalty: this.gamePenalty,
            gameBonus: this.gameBonus,
        };
        this.socketClientService.send(GameEvents.UpdateConstants, data);
        this.showAlert('Les valeurs ont été sauvegardées.');
        location.reload();
    }
    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
