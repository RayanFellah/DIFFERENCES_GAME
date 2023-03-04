import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Sheet } from '@common/sheet';
import { catchError, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
    providedIn: 'root',
})
export class SheetHttpService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    getAllSheets(): Observable<Sheet[]> {
        return this.http.get<Sheet[]>(`${this.baseUrl}/sheet`).pipe(catchError(this.handleError<Sheet[]>('getAllSheets')));
    }

    createSheet(sheetForm: FormData): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/sheet`, sheetForm, { observe: 'response', responseType: 'text' });
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
