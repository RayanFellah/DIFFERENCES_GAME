import { Component, OnDestroy, OnInit } from '@angular/core';
import { DifferencesFoundService } from '@app/services/differences-found.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-differences-found',
    templateUrl: './differences-found.component.html',
    styleUrls: ['./differences-found.component.scss'],
})
export class DifferencesFoundComponent implements OnInit, OnDestroy {
    differences: boolean[] = [];

    allDifferencesFound = false;
    nextDifferenceIndex = 0;
    differencesFound: number;
     differencesFoundSubscription: Subscription;
    constructor(private differencesFoundService: DifferencesFoundService) {}
    ngOnInit() {
        this.differencesFoundSubscription = this.differencesFoundService.getAttributeSubject().subscribe((value) => {
            this.differencesFound = value;
            this.differenceIsFound(value);
        });
        for (let i = 0; i < this.differencesFoundService.numberOfDifferences; i++) {
            this.differences.push(false);
        }
    }

    differenceIsFound(index: number) {
        this.differences[index] = true;
    }
    ngOnDestroy() {
        this.differencesFoundSubscription.unsubscribe();
    }
}
