import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TimerService } from '@app/services/timer.service';
import { TimerComponent } from './timer.component';

describe('TimerComponent', () => {
    let component: TimerComponent;
    let fixture: ComponentFixture<TimerComponent>;
    let timerService: TimerService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TimerComponent],
            providers: [TimerService],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TimerComponent);
        component = fixture.componentInstance;
        timerService = TestBed.inject(TimerService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should start timer service on init', () => {
        spyOn(timerService, 'start');
        component.ngOnInit();
        expect(timerService.start).toHaveBeenCalled();
    });

    it('should update minutes and seconds every second', fakeAsync(() => {
        spyOn(timerService, 'getMinutes').and.returnValue(1);
        spyOn(timerService, 'getSeconds').and.returnValue(30);

        component.ngOnInit();
        tick(1000);

        expect(component.minutes).toBe(1);
        expect(component.seconds).toBe(30);
    }));
});
