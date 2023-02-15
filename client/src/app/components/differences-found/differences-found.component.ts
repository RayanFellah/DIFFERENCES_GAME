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
    private differencesFoundSubscription: Subscription;
    constructor(private differencesFoundService: DifferencesFoundService) {}
    ngOnInit() {
        this.differencesFoundSubscription = this.differencesFoundService.getAttributeSubject().subscribe((value) => {
            this.differencesFound = value;
            this.differenceIsFound(value);
        });
        console.log(this.differencesFoundService.numberOfDiffernces);
        for (let i = 0; i < this.differencesFoundService.numberOfDiffernces; i++) {
            this.differences.push(false);
        }
    }

    differenceIsFound(index: number) {
        this.differences[index] = true;
        // this.nextDifferenceIndex = this.differences.findIndex((difference) => !difference.isFound);
        // this.allDifferencesFound = this.nextDifferenceIndex === -1;
    }
    ngOnDestroy() {
        this.differencesFoundSubscription.unsubscribe();
    }
}
