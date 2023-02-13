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
    upload(title: string, radius: number, bool: boolean): Observable<unknown> {
        const file0 = this.files[0];
        const file1 = this.files[1];
        console.log(this.files.length);
        if (this.files.length === 2) {
            // this.files.length = 0;
            return this.http2.uploadImages(file0, file1, bool, radius, title);
        }
        return EMPTY;
    }

    getImages(sheetId: string) {
        return {
            original: this.http.get(`${this.baseApiUrl}/${sheetId}/?original='true'`),
            modified: this.http.get(`${this.baseApiUrl}/${sheetId}/?original='false'`),
        };
    }

    removeFile(f: File) {
        this.files = this.files.filter((file) => f !== file);
    }
}
