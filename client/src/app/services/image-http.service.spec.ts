import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ImageHttpService } from './image-http.service';

describe('ImageHttpService', () => {
    let service: ImageHttpService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ImageHttpService],
        });
        service = TestBed.inject(ImageHttpService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should get image successfully', () => {
        const fileName = 'test.jpg';
        const mockResponse = new Blob(['test data'], { type: 'image/jpeg' });

        service.getImage(fileName).subscribe((response: Blob) => {
            expect(response).toEqual(mockResponse);
        });

        const request = httpMock.expectOne(`${service['baseUrl']}/image/${fileName}`);
        expect(request.request.method).toBe('GET');
        request.flush(mockResponse);
    });

    it('should compare images successfully', () => {
        const sheetForm = new FormData();
        sheetForm.append('originalImage', new File(['original image'], 'original.jpg'));
        sheetForm.append('modifiedImage', new File(['modified image'], 'modified.jpg'));
        const mockResponse = { differences: 5 };

        service.getDifferences(sheetForm).subscribe((response: unknown) => {
            expect(response.body).toEqual(mockResponse);
        });

        const request = httpMock.expectOne(`${service['baseUrl']}/image/compare`);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual(sheetForm);
        request.flush(mockResponse);
    });
});
