import { Component, OnInit } from '@angular/core';
@Component({
    selector: 'app-differences-found',
    templateUrl: './differences-found.component.html',
    styleUrls: ['./differences-found.component.scss'],
})
export class DifferencesFoundComponent implements OnInit {
    differences = [
        { coord: '10', isFound: false },
        { coord: '12', isFound: false },
        { coord: '30', isFound: false },
        { coord: '30', isFound: false },
        { coord: '30', isFound: false },
        { coord: '30', isFound: false },
        { coord: '30', isFound: false },
    ];
    allDifferencesFound = false;
    nextDifferenceIndex = 0;
    // diffFound = this.logic.differencesFound;
    // constructor(private logic: GameLogicService) {}

    ngOnInit() {}

    differenceIsFound(index: number) {
        this.differences[index].isFound = true;
        this.nextDifferenceIndex = this.differences.findIndex((difference) => !difference.isFound);
        this.allDifferencesFound = this.nextDifferenceIndex === -1;
    }
}
