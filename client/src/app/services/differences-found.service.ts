import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class DifferencesFoundService {
    numberOfDiffernces: number = 0;
    private differencesFoundSubject = new Subject<number>();
    setAttribute(value: number) {
        this.differencesFoundSubject.next(value - 1);
    }
    setNumberOfDifferences(amount: number) {
        this.numberOfDiffernces = amount;
    }
    getAttributeSubject(): Subject<number> {
        return this.differencesFoundSubject;
    }
}
