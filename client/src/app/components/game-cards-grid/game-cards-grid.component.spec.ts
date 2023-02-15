// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { DomSanitizer } from '@angular/platform-browser';
// import { of } from 'rxjs';

// import { HttpService } from '@app/services/http.service';
// import { GameCardsGridComponent } from './game-cards-grid.component';

// describe('GameCardsGridComponent', () => {
//     let component: GameCardsGridComponent;
//     let fixture: ComponentFixture<GameCardsGridComponent>;
//     let httpService: HttpService;
//     let sanitizer: DomSanitizer;

//     beforeEach(async () => {
//         await TestBed.configureTestingModule({
//             declarations: [GameCardsGridComponent],
//             imports: [HttpClientTestingModule],
//         }).compileComponents();
//     });

//     beforeEach(() => {
//         fixture = TestBed.createComponent(GameCardsGridComponent);
//         component = fixture.componentInstance;
//         httpService = TestBed.inject(HttpService);
//         sanitizer = TestBed.inject(DomSanitizer);
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     it('should initialize', () => {
//         spyOn(httpService, 'getAllSheets').and.returnValue(of([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]));
//         spyOn(httpService, 'getImage').and.returnValue(of(new Blob()));
//         component.ngOnInit();
//         expect(httpService.getAllSheets).toHaveBeenCalled();
//         expect(httpService.getImage).toHaveBeenCalledTimes(5);
//         expect(component.gridGameSheets).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
//         expect(component.length).toBe(5);
//     });

//     it('should go to the next grid', () => {
//         component.gridIndexStart = 0;
//         component.gridIndexEnd = 4;
//         component.nextGrid();
//         expect(component.gridIndexStart).toBe(4);
//         expect(component.gridIndexEnd).toBe(8);
//     });

//     it('should go to the previous grid', () => {
//         component.gridIndexStart = 4;
//         component.gridIndexEnd = 8;
//         component.prevGrid();
//         expect(component.gridIndexStart).toBe(0);
//         expect(component.gridIndexEnd).toBe(4);
//     });
// });
