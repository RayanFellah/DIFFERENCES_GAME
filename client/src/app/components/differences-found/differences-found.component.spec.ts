import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DifferencesFoundService } from '@app/services/differences-found.service';
import { DifferencesFoundComponent } from './differences-found.component';

describe('DifferencesFoundComponent', () => {
  let component: DifferencesFoundComponent;
  let fixture: ComponentFixture<DifferencesFoundComponent>;
  let differencesFoundService: DifferencesFoundService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DifferencesFoundComponent],
      providers: [DifferencesFoundService]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DifferencesFoundComponent);
    component = fixture.componentInstance;
    differencesFoundService = TestBed.inject(DifferencesFoundService);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize differences array with false values', () => {
    expect(component.differences.length).toBe(differencesFoundService.numberOfDifferences);
    expect(component.differences.every((value) => value === false)).toBeTrue();
  });

  it('should mark a difference as found when differencesFoundService emits a value', () => {
    const index = 2;
    differencesFoundService.getAttributeSubject().next(index);
    expect(component.differences[index]).toBeTrue();
  });

  it('should unsubscribe from differencesFoundSubscription on component destroy', () => {
    const unsubscribeSpy = spyOn(component.differencesFoundSubscription, 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it('should display congratulations message when all differences are found', () => {
    component.allDifferencesFound = true;
    fixture.detectChanges();
    const messageElement = fixture.nativeElement.querySelector('.congratulations-message');
    expect(messageElement).toBeTruthy();
    expect(messageElement.textContent.trim()).toEqual('Congratulations! You found all the differences.');
  });

  it('should not display congratulations message when not all differences are found', () => {
    component.allDifferencesFound = false;
    fixture.detectChanges();
    const messageElement = fixture.nativeElement.querySelector('.congratulations-message');
    expect(messageElement).toBeFalsy();
  });

  it('should display correct number of found and not-found differences', () => {
    const numberOfDifferences = differencesFoundService.numberOfDifferences;
    component.differences = Array.from({ length: numberOfDifferences }, () => true);
    fixture.detectChanges();
    const foundElements = fixture.nativeElement.querySelectorAll('.found .found-lightbulb');
    expect(foundElements.length).toEqual(numberOfDifferences);
    const notFoundElements = fixture.nativeElement.querySelectorAll('.found .not-found-lightbulb');
    expect(notFoundElements.length).toEqual(0);
  });
});