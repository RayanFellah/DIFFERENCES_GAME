import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SheetHttpService } from '@app/services/sheet-http.service';
import { of } from 'rxjs';

import { SelectionPageComponent } from './selection-page.component';

describe('SelectionPageComponent', () => {
    let component: SelectionPageComponent;
    let fixture: ComponentFixture<SelectionPageComponent>;
    let sheetHttpServiceSpy: jasmine.SpyObj<SheetHttpService>;

    beforeEach(() => {
        sheetHttpServiceSpy = jasmine.createSpyObj('SheetHttpService', ['getAllSheets']);
        sheetHttpServiceSpy.getAllSheets.and.returnValue(of([]));
    });
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SelectionPageComponent],
            providers: [{ provide: SheetHttpService, useValue: sheetHttpServiceSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(SelectionPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
