import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class LocalStorageService {
    constructor(private localStorage: Storage) {}

    setData(key: string, value: unknown) {
        this.localStorage.setItem(key, JSON.stringify(value));
    }

    getData(key: string): string | undefined {
        const data = this.localStorage.getItem(key);
        if (data) {
            return data;
        } else {
            return undefined;
        }
    }
}
