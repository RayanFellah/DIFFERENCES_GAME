import { TestBed } from '@angular/core/testing';
import { EventService } from './event-service.service';

describe('EventService', () => {
    let service: EventService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [EventService],
        });
        service = TestBed.inject(EventService);
    });

    it('should emit a difference found event', () => {
        const spy = jasmine.createSpy('differenceFound');
        service.differenceFound$.subscribe(spy);

        service.emitDifferenceFound(true);

        expect(spy).toHaveBeenCalledWith(true);
    });

    it('should not emit a difference found event when there are no subscribers', () => {
        const spy = jasmine.createSpy('differenceFound');
        const subscription = service.differenceFound$.subscribe(spy);

        if (!subscription.closed) {
            subscription.unsubscribe();
        }

        service.emitDifferenceFound(true);

        expect(spy).not.toHaveBeenCalled();
    });
});
