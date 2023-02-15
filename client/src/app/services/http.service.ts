import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { Coord } from '@app/interfaces/coord';
import { Sheet } from '@app/interfaces/sheet';
import { Observable } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class HttpService {
    apiUrl = 'http://localhost:3000/api';
    imagePath: SafeUrl;

    constructor(private readonly http: HttpClient) {}
    get imagepath(): SafeUrl {
        return this.imagePath;
    }
    getAllSheets(): Observable<Sheet[]> {
        return this.http.get<Sheet[]>(this.apiUrl + '/sheets/');
    }

    getDifferences() {
        return this.http.get<{ numberDifferences: number; difficulty: string }>(`${this.apiUrl}/sheets/game/current/differences`);
    }

    setSheet(sheetId: string, playerName: string) {
        return this.http.post<string>(`${this.apiUrl}select/:${sheetId}/?player=${playerName}`, {});
    }

    getImage(sheet: Sheet, original: boolean) {
        console.log('getImages');
        return this.http.get(`${this.apiUrl}/images/${sheet.sheetId}/?original=${original}`, { responseType: 'blob' });
    }

    getCurrentGame() {
        return this.http.get<Sheet>(`${this.apiUrl}/sheets/game/current/`);
    }

    sendPlaySheet(sheet: Sheet) {
        console.log('done');
        return this.http.post(`${this.apiUrl}/sheets/game/current/${sheet.sheetId}`, {});
    }

    uploadImages(original: File, modified: File, valid: boolean, radius: number, title: string) {
        const formData = new FormData();

        formData.append('original', original);
        formData.append('modified', modified);

        return this.http.post(`${this.apiUrl}/images/upload/?valid=${valid}&radius=${radius}&title=${title}`, formData);
    }

    playerClick(sheetId: string, posX: number, posY: number): Observable<Coord[]> {
        return this.http.get<Coord[]>(`${this.apiUrl}/game/${sheetId}?x=${posX}&y=${posY}`, {});
    }
}
