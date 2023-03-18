import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { ImageHttpService } from './image-http.service';

describe('ImageHttpService', () => {
    let service: ImageHttpService;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ImageHttpService],
        });
        service = TestBed.inject(ImageHttpService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('#getImage', () => {
        it('should return an image blob', () => {
            const fileName = 'test.png';
            const blob = new Blob([''], { type: 'image/png' });
            service.getImage(fileName).subscribe((response) => {
                expect(response.type).toEqual('image/png');
            });
            const req = httpTestingController.expectOne(`${environment.serverUrl}/image/${fileName}`);
            expect(req.request.method).toEqual('GET');
            req.flush(blob);
        });
    });

    describe('#getDifferences', () => {
        it('should return a JSON object with a response status', () => {
            const formData = new FormData();
            const blob = new Blob([''], { type: 'image/png' });
            formData.append('image', blob, 'test.png');
            const expectedResponse = {
                status: 200,
            };
            service.getDifferences(formData).subscribe((response) => {
                const expected = 200;
                expect(response.status).toEqual(expected);
            });
            const req = httpTestingController.expectOne(`${environment.serverUrl}/image/compare`);
            expect(req.request.method).toEqual('POST');
            expect(req.request.body.get('image')).toEqual(formData.get('image'));
            req.flush(expectedResponse, { status: 200, statusText: 'OK' });
        });
    });
});
