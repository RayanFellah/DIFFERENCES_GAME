import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DialogService {
    cancel = new BehaviorSubject<boolean>(false);
    cancel$ = this.cancel.asObservable();

    playerName = new BehaviorSubject<string>('');
    playerNames$ = this.playerName.asObservable();
    emitCancellation() {
        this.cancel.next(true);
    }

    emitPlayerNames(playerName: string) {
        this.playerName.next(playerName);
    }
}
