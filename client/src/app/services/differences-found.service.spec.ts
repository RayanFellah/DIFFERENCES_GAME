import { DifferencesFoundService } from './differences-found.service';

describe('DifferencesFoundService', () => {
    let service: DifferencesFoundService;

    beforeEach(() => {
        service = new DifferencesFoundService();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have initial numberOfDifferences set to zero', () => {
        expect(service.numberOfDifferences).toBe(0);
    });

    describe('setAttribute()', () => {
        it('should subtract 1 from the given value and notify subscribers', () => {
            const value = 5;
            const spy = spyOn(service.getAttributeSubject(), 'next');
            service.setAttribute(value);
            expect(spy).toHaveBeenCalledWith(value - 1);
        });
    });

    describe('setNumberOfDifferences()', () => {
        it('should set numberOfDifferences to the given amount', () => {
            const amount = 3;
            service.setNumberOfDifferences(amount);
            expect(service.numberOfDifferences).toBe(amount);
        });
    });

    describe('getAttributeSubject()', () => {
        it('should return the differencesFoundSubject', () => {
            expect(service.getAttributeSubject()).toBe(service.differencesFoundSubject);
        });
    });
});
