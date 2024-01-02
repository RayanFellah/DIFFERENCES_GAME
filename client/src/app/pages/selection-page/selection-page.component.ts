import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, Output } from '@angular/core';
import { SheetHttpService } from '@app/services/sheet-http.service';
import { Sheet } from '@common/sheet';

@Component({
    selector: 'app-selection-page',
    templateUrl: './selection-page.component.html',
    styleUrls: ['./selection-page.component.scss'],
})
export class SelectionPageComponent implements OnInit {
    @Output() sheets: Sheet[];
    playerName: string;
    constructor(private readonly sheetHttpService: SheetHttpService) {}

    ngOnInit(): void {
        this.sheetHttpService.getAllSheets().subscribe({
            next: (response) => {
                this.sheets = response;
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Le serveur ne répond pas et a retourné : ${err.message}`;
                window.alert(responseString);
            },
        });
    }
}
