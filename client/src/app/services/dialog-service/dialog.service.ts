import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DialogService {
    cancel = new BehaviorSubject<boolean>(false);
    cancel$ = this.cancel.asObservable();

    cancelJoin = new BehaviorSubject<boolean>(false);
    cancelJoin$ = this.cancelJoin.asObservable();

    playerRejected = new BehaviorSubject<string | null>('');
    playerRejected$ = this.playerRejected.asObservable();

    playerConfirmed = new BehaviorSubject<string | null>(null);
    playerConfirmed$ = this.playerConfirmed.asObservable();

    playerName = new BehaviorSubject<string[]>([]);
    playerNames$ = this.playerName.asObservable();

    emitCancellation() {
        this.playerName.next([]);
        this.cancel.next(true);
    }
    emitJoinCancellation() {
        this.cancelJoin.next(true);
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

    reset() {
        this.cancel.next(false);
        this.playerConfirmed.next(null);
        this.playerRejected.next(null);
        this.playerName.next([]);
    }
}
