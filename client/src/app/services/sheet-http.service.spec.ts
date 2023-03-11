import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Sheet } from '@common/sheet';
import { environment } from 'src/environments/environment';
import { SheetHttpService } from './sheet-http.service';

describe('SheetHttpService', () => {
    let httpMock: HttpTestingController;
    let sheetHttpService: SheetHttpService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [SheetHttpService],
        });

        httpMock = TestBed.inject(HttpTestingController);
        sheetHttpService = TestBed.inject(SheetHttpService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(sheetHttpService).toBeTruthy();
    });

    describe('getAllSheets', () => {
        it('should return an Observable<Sheet[]>', () => {
            const mockSheets: Sheet[] = [
                {
                    _id: '1',
                    title: 'Sheet 1',
                    originalImagePath: 'path/to/original/image',
                    modifiedImagePath: 'path/to/modified/image',
                    difficulty: 'Easy',
                    radius: 5,
                    topPlayer: 'John',
                    differences: 10,
                },
                {
                    _id: '2',
                    title: 'Sheet 2',
                    originalImagePath: 'path/to/original/image',
                    modifiedImagePath: 'path/to/modified/image',
                    difficulty: 'Medium',
                    radius: 10,
                    topPlayer: 'Jane',
                    differences: 15,
                },
            ];

            sheetHttpService.getAllSheets().subscribe((sheets) => {
                expect(sheets.length).toBe(2);
                expect(sheets).toEqual(mockSheets);
            });

            const req = httpMock.expectOne(`${environment.serverUrl}/sheet`);
            expect(req.request.method).toBe('GET');
            req.flush(mockSheets);
        });

        it('should handle error', () => {
            const error = new Error('An error occurred.');

            sheetHttpService.getAllSheets().subscribe(
                () => {
                    fail('should have failed with the error');
                },
                (err) => {
                    expect(err).toEqual(error);
                },
            );

            const req = httpMock.expectOne(`${environment.serverUrl}/sheet`);
            expect(req.request.method).toBe('GET');
            req.flush(null, { status: 500, statusText: 'Server Error' });
        });
    });

    describe('createSheet', () => {
        it('should return an Observable<any>', () => {
            const formData = new FormData();
            formData.append('title', 'Sheet 3');
            formData.append('originalImage', new Blob());
            formData.append('modifiedImage', new Blob());
            formData.append('difficulty', 'Hard');
            formData.append('radius', '15');

            sheetHttpService.createSheet(formData).subscribe((res) => {
                expect(res).toBeTruthy();
            });

            const req = httpMock.expectOne(`${environment.serverUrl}/sheet`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(formData);
            req.flush({});
        });
    });

    describe('deleteSheet', () => {
        it('should return an Observable<void>', () => {
            const id = '1';

            sheetHttpService.deleteSheet(id).subscribe((res) => {
                expect(res).toBeUndefined();
            });

            const req = httpMock.expectOne(`${environment.serverUrl}/sheet/${id}`);
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });

        it('should handle error if server returns error status code', () => {
            const id = '1';
            const errorMessage = 'Error: Sheet could not be deleted';
            sheetHttpService.deleteSheet(id).subscribe(
                () => {},
                (error) => {
                    expect(error.message).toBe(errorMessage);
                },
            );

            const req = httpMock.expectOne(`${environment.serverUrl}/sheet/${id}`);
            expect(req.request.method).toBe('DELETE');
            req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
        });
    });
});
