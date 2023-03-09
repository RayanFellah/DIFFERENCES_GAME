import { Injectable } from '@angular/core';
import { PlayRoom } from '@common/play-room';
@Injectable({
    providedIn: 'root',
})
export class LocalStorageService {
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
