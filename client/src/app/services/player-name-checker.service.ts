import { Injectable } from '@angular/core';

const MIN_NAME_LENGTH = 1;

@Injectable({
    providedIn: 'root',
})
export class playerNameCheckerService {
    isValidInput(value: string): boolean {
        return this.testLength(value) && this.testSpaces(value);
    }

    testLength(value: string) {
        return value.length >= MIN_NAME_LENGTH;
    }

    testSpaces(value: string) {
        return /\S/.test(value);
    }
}
