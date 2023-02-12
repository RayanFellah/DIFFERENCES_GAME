import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { HttpService } from './http.service';
@Injectable({
    providedIn: 'root',
})
export class ImageUploaderService {
    // API url
    baseApiUrl = 'http://localhost:3000/';
    fileName: string;
    files: File[] = [];
    constructor(private readonly http: HttpClient, private readonly http2: HttpService) {}

    setImage(file: File) {
        this.files.push(file);
    }
    // Returns an observable
    upload(radius: number, bool: boolean): Observable<unknown> {
        if (this.files.length === 2) {
            const formData = new FormData();
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            formData.append('original', this.files[0]);
            formData.append('modified', this.files[1]);
            return this.http2.uploadImages(this.files[0], this.files[1], bool, radius);
        }
        return EMPTY;
    }

    getImages(sheetId: string) {
        return {
            original: this.http.get(`${this.baseApiUrl}/${sheetId}/?original='true'`),
            modified: this.http.get(`${this.baseApiUrl}/${sheetId}/?original='false'`),
        };
    }
}
