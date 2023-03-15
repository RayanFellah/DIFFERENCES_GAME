import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DialogService {
    cancel = new BehaviorSubject<boolean>(false);
    cancel$ = this.cancel.asObservable();

    playerName = new BehaviorSubject<string[]>([]);
    playerNames$ = this.playerName.asObservable();
    emitCancellation() {
        this.playerName.next([]);
        this.cancel.next(true);
    }

    emitPlayerNames(playerName: string) {
        const currentNames = this.playerName.getValue();
        console.log(currentNames);
        currentNames.push(playerName);

        this.playerName.next(currentNames);
    }
}
