import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DialogService {
    cancel = new BehaviorSubject<boolean>(false);
    cancel$ = this.cancel.asObservable();

    selectSoloLimitedTime = new BehaviorSubject<boolean>(false);
    selectSoloLimitedTime$ = this.selectSoloLimitedTime.asObservable();

    selectCoopLimitedTime = new BehaviorSubject<boolean>(false);
    selectCoopLimitedTime$ = this.selectCoopLimitedTime.asObservable();

    lunchCoopGame = new BehaviorSubject<boolean>(false);
    lunchCoopGame$ = this.lunchCoopGame.asObservable();

    cancelJoin = new BehaviorSubject<boolean>(false);
    cancelJoin$ = this.cancelJoin.asObservable();

    playerRejected = new BehaviorSubject<string | null>('');
    playerRejected$ = this.playerRejected.asObservable();

    playerConfirmed = new BehaviorSubject<string | null>(null);
    playerConfirmed$ = this.playerConfirmed.asObservable();

    playerName = new BehaviorSubject<string[]>([]);
    playerNames$ = this.playerName.asObservable();

    shouldReplay = new BehaviorSubject<boolean>(false);
    shouldReplay$ = this.shouldReplay.asObservable();

    emitCancellation() {
        this.playerName.next([]);
        this.cancel.next(true);
    }

    emitJoinCancellation() {
        this.cancelJoin.next(true);
    }
    emitCoopLunch() {
        this.lunchCoopGame.next(true);
    }

    emitRejection(playerName: string) {
        const currentNames = this.playerName.getValue();
        const updateNames = currentNames.filter((name: string) => name !== playerName);
        this.playerName.next(updateNames);
        this.playerRejected.next(playerName);
    }

    emitPlayerNames(playerName: string) {
        const currentNames = this.playerName.getValue();
        currentNames.push(playerName);
        this.playerName.next(currentNames);
    }

    emitConfirmation(playerName: string) {
        this.playerName.next([]);
        this.playerConfirmed.next(playerName);
    }
    emitReplay(shouldReplay: boolean) {
        this.shouldReplay.next(shouldReplay);
    }

    selectSoloLimitedTimeMode() {
        this.selectSoloLimitedTime.next(true);
    }

    selectCoopLimitedTimeMode() {
        this.selectCoopLimitedTime.next(true);
    }

    reset() {
        this.cancel.next(false);
        this.selectSoloLimitedTime.next(false);
        this.selectCoopLimitedTime.next(false);
        this.playerConfirmed.next(null);
        this.playerRejected.next(null);
        this.playerName.next([]);
        this.lunchCoopGame.next(false);
        this.selectCoopLimitedTime.next(false);
        this.selectSoloLimitedTime.next(false);
    }
}
