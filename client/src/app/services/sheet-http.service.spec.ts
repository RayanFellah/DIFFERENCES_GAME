import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Sheet } from '@common/sheet';
import { SheetHttpService } from './sheet-http.service';

describe('SheetHttpService', () => {
    let service: SheetHttpService;
    let httpMock: HttpTestingController;
    const testUrl = 'https://example.com';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [SheetHttpService, { provide: 'SERVER_URL', useValue: testUrl }],
        });

        service = TestBed.inject(SheetHttpService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get all sheets successfully', () => {
        const mockResponse: Sheet[] = [
            {
                _id: '1',
                title: 'Sheet 1',
                originalImagePath: '',
                modifiedImagePath: '',
                difficulty: '',
                radius: 0,
                topPlayer: '',
                differences: 0,
            },
        ];

        service.getAllSheets().subscribe((sheets: Sheet[]) => {
            expect(sheets).toEqual(mockResponse);
        });

        const req = httpMock.expectOne(`${testUrl}/sheet`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('should create a new sheet successfully', () => {
        const mockResponse = { id: '1', name: 'New Sheet' };
        const mockForm = new FormData();

        service.createSheet(mockForm).subscribe((res) => {
            expect(res).toEqual(mockResponse);
        });

        const req = httpMock.expectOne(`${testUrl}/sheet`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toBe(mockForm);
        req.flush(mockResponse);
    });

    it('should delete a sheet successfully', () => {
        const mockId = '1';

        service.deleteSheet(mockId).subscribe((res) => {
            expect(res).toBeUndefined();
        });

        const req = httpMock.expectOne(`${testUrl}/sheet/${mockId}`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });

    it('should get a sheet by id successfully', () => {
        const mockId = '1';
        const mockResponse = { id: mockId, name: 'Sheet 1' };

        service.getSheet(mockId).subscribe((sheet) => {
            expect(sheet).toEqual(mockResponse);
        });

        const req = httpMock.expectOne(`${testUrl}/sheet/${mockId}`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('should handle errors correctly', () => {
        const mockError = new Error('Test error');
        const errorHandlerSpy = jasmine.createSpy('errorHandler');

        service.getAllSheets().subscribe(() => {}, errorHandlerSpy);

        const req = httpMock.expectOne(`${testUrl}/sheet`);
        expect(req.request.method).toBe('GET');
        req.flush(null, { status: 500, statusText: 'Internal Server Error' });

        expect(errorHandlerSpy).toHaveBeenCalledWith(mockError);
    });
});
