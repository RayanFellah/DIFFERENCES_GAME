import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameHttpService {
    private readonly baseUrl: string = environment.serverUrl;
    constructor(private http: HttpClient) {}

    playerClick(sheetId: string, posX: number, posY: number): Observable<Vec2[]> {
        return this.http.get<Vec2[]>(`${this.baseUrl}/game/${sheetId}?x=${posX}&y=${posY}`, {});
    }

    getDifferences() {
        return this.http.get<{ numberDifferences: number; difficulty: string }>(`${this.baseUrl}/game/current/differences`);
    }

    // sendPlaySheet(sheet: Sheet) {
    //     // eslint-disable-next-line no-underscore-dangle
    //     console.log(sheet._id);
    //     // eslint-disable-next-line no-underscore-dangle
    //     return this.http.post(`${this.baseUrl}/game/current/${sheet._id}`, {});
    // }
    // getCurrentGame() {
    //     return this.http.get<Sheet>(`${this.baseUrl}/game/current`);
    // }
}
