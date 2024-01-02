import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ImageHttpService {
    private readonly baseUrl: string = environment.serverUrl;
    constructor(private readonly http: HttpClient) {}
    getImage(fileName: string) {
        return this.http.get(`${this.baseUrl}/image/${fileName}`, { responseType: 'blob' });
    }
    getDifferences(sheetForm: FormData): Observable<HttpResponse<object>> {
        return this.http.post(`${this.baseUrl}/image/compare`, sheetForm, { observe: 'response', responseType: 'json' });
    }
}
