import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { defaultIfEmpty, firstValueFrom, Observable, of } from 'rxjs';
import { HttpService } from './http.service';

@Injectable({
    providedIn: 'root',
})
export class ImageUploaderService {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result: any;
    baseApiUrl = 'http://localhost:3000/';
    fileName: string;
    files: File[] = [];

    constructor(private readonly http: HttpClient, private readonly http2: HttpService) {}

    setImage(file: File) {
        this.files.push(file);
    }

    verifyDifferences(title: string, radius: number, bool: boolean): Observable<object> {
        console.log(this.files.length);
        if (this.files.length === 2) {
            const file0 = this.files[0];
            const file1 = this.files[1];
            return this.http2.uploadImages(file0, file1, bool, radius, title);
        } else {
            return of({});
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async createGame(title: string, radius: number, bool: boolean): Promise<Observable<any>> {
        const file0 = this.files[0];
        const file1 = this.files[1];
        bool = false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result2: any = await firstValueFrom(this.verifyDifferences(title, radius, bool).pipe(defaultIfEmpty({ error: 'No images uploaded.' })));
        if (typeof result2 === 'object') {
            const y: number = +result2.differences;
            if (y >= 3 && y <= 9) {
                return this.http2.uploadImages(file0, file1, true, radius, title);
            }
            return of({});
        }
        return of({});
    }
    getImages(sheetId: string) {
        return {
            original: this.http.get(`${this.baseApiUrl}/${sheetId}/?original='true'`),
            modified: this.http.get(`${this.baseApiUrl}/${sheetId}/?original='false'`),
        };
    }

    removeFile(f: File) {
        const index = this.files.findIndex((file) => file === f);
        if (index !== -1) {
            this.files.splice(index, 1);
        }
    }
}
