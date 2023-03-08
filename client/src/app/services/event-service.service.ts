import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class EventService {
    differenceFoundSource = new Subject<boolean>();
    differenceFound$ = this.differenceFoundSource.asObservable();
    emitDifferenceFound(found: boolean) {
        this.differenceFoundSource.next(found);
    }
}
