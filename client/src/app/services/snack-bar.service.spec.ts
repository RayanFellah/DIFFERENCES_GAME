import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarService } from './snack-bar.service';

describe('SnackBarService', () => {
    let service: SnackBarService;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('MatSnackBar', ['open']);

        TestBed.configureTestingModule({
            providers: [SnackBarService, { provide: MatSnackBar, useValue: spy }],
        });

        service = TestBed.inject(SnackBarService);
        snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call MatSnackBar.open() method with the correct parameters', () => {
        const message = 'Test message';
        const action = 'Test action';
        const duration = 2000;

        service.openSnackBar(message, action);

        expect(snackBarSpy.open).toHaveBeenCalledWith(message, action, { duration });
    });
});
