import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DialogService {
    cancel = new BehaviorSubject<boolean>(false);
    cancel$ = this.cancel.asObservable();
    playerRejected = new BehaviorSubject<string>('');
    playerRejected$ = this.playerRejected.asObservable();

    playerConfirmed = new BehaviorSubject<string>('');
    playerConfirmed$ = this.playerConfirmed.asObservable();

    playerName = new BehaviorSubject<string[]>([]);
    playerNames$ = this.playerName.asObservable();
    emitCancellation() {
        this.playerName.next([]);
        this.cancel.next(true);
    }
    emitRejection(playerName: string) {
        const currentNames = this.playerName.getValue();
        const updateNames = currentNames.filter((name) => name !== playerName);
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
}
