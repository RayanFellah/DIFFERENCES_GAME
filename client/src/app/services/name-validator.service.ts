import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class NameValidatorService {
    validate(playerName: string): any {
        let validName = !(!playerName || playerName.trim().length === 0 || /^\d+$/.test(playerName));
        if (validName) {
            return true;
        } else {
            return false;
        }
    }
}
