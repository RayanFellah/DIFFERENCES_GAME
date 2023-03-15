import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SelectionPageComponent } from './selection-page.component';
import { SheetHttpService } from '@app/services/sheet-http.service';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Sheet } from '@common/sheet';

describe('SelectionPageComponent', () => {
  let component: SelectionPageComponent;
  let fixture: ComponentFixture<SelectionPageComponent>;
  let mockSheetHttpService: jasmine.SpyObj<SheetHttpService>;

  beforeEach(async () => {
    const sheetHttpServiceSpy = jasmine.createSpyObj('SheetHttpService', ['getAllSheets']);
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [SelectionPageComponent],
      providers: [{ provide: SheetHttpService, useValue: sheetHttpServiceSpy }],
    }).compileComponents();

    mockSheetHttpService = TestBed.inject(SheetHttpService) as jasmine.SpyObj<SheetHttpService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectionPageComponent);
    component = fixture.componentInstance;
  });

  it('should set sheets property when getAllSheets() returns data', () => {
    const sheets: Sheet[] = [
        { 
            _id: '1', 
            title: 'Sheet 1', 
            originalImagePath: 'path1',
            modifiedImagePath: 'path2',
            difficulty: 'easy',
            radius: 10,
            topPlayer: 'player1',
            differences: 5,
            isJoinable: true,
        },
        { 
            _id: '2', 
            title: 'Sheet 2', 
            originalImagePath: 'path3',
            modifiedImagePath: 'path4',
            difficulty: 'hard',
            radius: 20,
            topPlayer: 'player2',
            differences: 10,
            isJoinable: false,
        }
    ];
    mockSheetHttpService.getAllSheets.and.returnValue(of(sheets));
    component.ngOnInit();
    expect(component.sheets).toEqual(sheets);
});

  it('should show alert message when getAllSheets() returns error', () => {
    const errorMessage = 'Server error';
    mockSheetHttpService.getAllSheets.and.returnValue(throwError(new HttpErrorResponse({ error: errorMessage })));
    spyOn(window, 'alert');
    component.ngOnInit();
    expect(window.alert).toHaveBeenCalledWith(`Le serveur ne répond pas et a retourné : ${errorMessage}`);
  });
});



