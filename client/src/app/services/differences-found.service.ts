import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class DifferencesFoundService {
    numberOfDifferences: number = 0;
    differencesFoundSubject = new Subject<number>();
    setAttribute(value: number) {
        this.differencesFoundSubject.next(value - 1);
    }
    setNumberOfDifferences(amount: number) {
        this.numberOfDifferences = amount;
    }
    getAttributeSubject(): Subject<number> {
        return this.differencesFoundSubject;
    }
}
