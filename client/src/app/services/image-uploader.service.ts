import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ImageUploaderService {
    // API url
    baseApiUrl = 'http://localhost:3000/';
    fileName: string;
    constructor(private http: HttpClient) {}

    // Returns an observable
    upload(file: File): Observable<unknown> {
        if (file) {
            this.fileName = file.name;
            const formData = new FormData();
            formData.append('file', file, file.name);
            return this.http.post('http://localhost:3000/images/upload', formData);
        }
        return EMPTY;
    }
}
