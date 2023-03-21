import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameHttpService {
    private readonly baseUrl: string = environment.serverUrl;
    constructor(private http: HttpClient) {}
    getAllDifferences(id: string) {
        return this.http.get<Vec2[][]>(`${this.baseUrl}/game/current/allDifferences/${id}`);
    }
}
