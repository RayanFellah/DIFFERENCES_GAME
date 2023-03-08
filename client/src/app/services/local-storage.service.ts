import { Injectable } from '@angular/core';
import { PlayRoom } from '@common/play-room';
import { Sheet } from '@common/sheet';
import { Storage } from '@ionic/storage';
@Injectable({
    providedIn: 'root',
})
export class LocalStorageService {
    constructor(private localStorage: Storage) {}

    async createStorage(): Promise<void> {
        await this.localStorage.create();
    }

    setData(key: string, value: unknown): void {
        this.localStorage.set(key, JSON.stringify(value));
    }
    setGame(key: string, value: Sheet): void {
        this.localStorage.set(key, JSON.stringify(value));
    }
    async getPlayRoom(key: string): Promise<PlayRoom> {
        console.log('in storage');
        return JSON.parse(await this.localStorage.get(key));
    }

    async getPlayerName(key: string): Promise<string> {
        return JSON.parse(await this.localStorage.get(key));
    }
}
