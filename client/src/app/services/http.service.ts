import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Coord } from '@app/interfaces/coord';
import { Sheet } from '@app/interfaces/sheet';
import { Observable } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class HttpService {
    apiUrl = 'http://localhost:3000/api';

    constructor(private readonly http: HttpClient) {}

    getAllSheets(): Observable<Sheet[]> {
        return this.http.get<Sheet[]>(this.apiUrl + 'sheets/');
    }

    setSheet(sheetId: string, playerName: string) {
        return this.http.post<string>(`${this.apiUrl}select/:${sheetId}/?player=${playerName}`, {});
    }

    getImage(sheetId: string, original: boolean): Observable<File> {
        return this.http.get<File>(`${this.apiUrl}images/${sheetId}/?original=${original}`);
    }

    getImages(sheetId: string): { original: Observable<File>; modified: Observable<Blob> } {
        return {
            original: this.getImage(sheetId, true),
            modified: this.getImage(sheetId, false),
        };
    }

    start() {
        return this.http.get<{ numberOfdiffs: number; gameSheet: Sheet }>(`${this.apiUrl}/game/start`);
    }

    uploadImages(original: File, modified: File, valid: boolean, radius: number) {
        const formData = new FormData();

        formData.append('original', original);
        formData.append('modified', modified);

        return this.http.post(`${this.apiUrl}/images/upload/?valid=${valid}&radius=${radius}`, formData);
    }

    playerClick(sheetId: string, posX: number, posY: number): Observable<Coord[]> {
        return this.http.get<Coord[]>(`${this.apiUrl}/game/:${sheetId}?x=${posX}&y=${posY}`, {});
    }
}
