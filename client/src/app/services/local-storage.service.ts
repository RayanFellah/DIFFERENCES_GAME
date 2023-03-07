import { Injectable } from '@angular/core';
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

    async getData(key: string): Promise<string | undefined> {
        return await this.localStorage.get(key);
    }
}
