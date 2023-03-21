import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/interfaces/vec2';
import { environment } from 'src/environments/environment';
import { GameHttpService } from './game-http.service';

describe('GameHttpService', () => {
    let service: GameHttpService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [GameHttpService],
        });

        service = TestBed.inject(GameHttpService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call the correct URL for getAllDifferences', () => {
        const id = '1';
        const mockResponse: Vec2[][] = [[{ posX: 0, posY: 0 }]];
        const expectedUrl = `${environment.serverUrl}/game/current/allDifferences/${id}`;

        service.getAllDifferences(id).subscribe((response) => {
            expect(response).toEqual(mockResponse);
        });

        const request = httpMock.expectOne(expectedUrl);
        expect(request.request.method).toBe('GET');
        request.flush(mockResponse);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
