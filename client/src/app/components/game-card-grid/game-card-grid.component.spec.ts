import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SheetHttpService } from '@app/services/sheet-http.service';
import { of } from 'rxjs';

import { GameCardGridComponent } from './game-card-grid.component';

describe('GameCardGridComponent', () => {
    let component: GameCardGridComponent;
    let fixture: ComponentFixture<GameCardGridComponent>;
    let sheetHttpServiceSpy: jasmine.SpyObj<SheetHttpService>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;

    beforeEach(() => {
        sheetHttpServiceSpy = jasmine.createSpyObj('SheetHttpService', ['getAllSheets']);
        sheetHttpServiceSpy.getAllSheets.and.returnValue(of([]));
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open', 'closeAll']);
    });
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCardGridComponent],
            providers: [
                { provide: SheetHttpService, useValue: sheetHttpServiceSpy },
                { provide: MatDialog, useValue: dialogSpy },
                { provide: Router, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GameCardGridComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
