import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DifferencesFoundService } from '@app/services/differences-found.service';
import { Subject, Subscription } from 'rxjs';
import { DifferencesFoundComponent } from './differences-found.component';

describe('DifferencesFoundComponent', () => {
    let component: DifferencesFoundComponent;
    let fixture: ComponentFixture<DifferencesFoundComponent>;
    let differencesFoundServiceSpy: jasmine.SpyObj<DifferencesFoundService>;

    beforeEach(async () => {
        differencesFoundServiceSpy = jasmine.createSpyObj('DifferencesFoundService', ['getAttributeSubject']);
        await TestBed.configureTestingModule({
            declarations: [DifferencesFoundComponent],
            providers: [{ provide: DifferencesFoundService, useValue: differencesFoundServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DifferencesFoundComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize differences array with the correct length', () => {
        const numberOfDifferences = 3;
        differencesFoundServiceSpy.numberOfDifferences = numberOfDifferences;
        fixture.detectChanges();
        expect(component.differences).toEqual(new Array(numberOfDifferences).fill(false));
    });

    it('should mark the correct difference as found when a difference is found', () => {
        const value = 1;
        differencesFoundServiceSpy.getAttributeSubject.and.returnValue(new Subject<number>());
        fixture.detectChanges();
        differencesFoundServiceSpy.getAttributeSubject().next(value);
        expect(component.differences[value]).toBeTrue();
    });

    it('should unsubscribe from differencesFoundSubscription on destroy', () => {
        const unsubscribeSpy = jasmine.createSpyObj<Subscription>('unsubscribe', ['unsubscribe']);
        differencesFoundServiceSpy.getAttributeSubject.and.returnValue(new Subject<number>());
        fixture.detectChanges();
        component.ngOnDestroy();
        expect(unsubscribeSpy.unsubscribe).toHaveBeenCalled();
    });
});
