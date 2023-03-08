import { Injectable } from '@angular/core';
import { PlayRoom } from '@common/play-room';
@Injectable({
    providedIn: 'root',
})
export class LocalStorageService {
    // constructor() {}

    // async createStorage(): Promise<void> {
    //     await this.localStorage.create();
    // }

    // async setRoom(key: string, value: PlayRoom): Promise<void> {
    //     await this.localStorage.set(key, JSON.stringify(value));
    // }
    // async setGame(key: string, value: Sheet): Promise<void> {
    //     await this.localStorage.set(key, JSON.stringify(value));
    // }
    // async setName(key: string, value: string): Promise<void> {
    //     await this.localStorage.set(key, value);
    // }
    // async getPlayRoom(key: string): Promise<PlayRoom> {
    //     return JSON.parse(await this.localStorage.get(key));
    // }

    // async getPlayerName(key: string): Promise<string> {
    //     return JSON.parse(await this.localStorage.get(key));
    // }

    setPlayRoom(room: PlayRoom) {
        localStorage.setItem('currentRoom', JSON.stringify(room));
    }

    setName(name: string) {
        localStorage.setItem('playerName', name);
    }
    getName() {
        const name = localStorage.getItem('playerName');
        return name ? name : undefined;
    }

    getRoom() {
        const room = localStorage.getItem('currentRoom');
        return room ? JSON.parse(room) : undefined;
    }
}
