import { Injectable } from '@angular/core';
import { PlayRoom } from '@common/play-room';
@Injectable({
    providedIn: 'root',
})
export class LocalStorageService {
    tabID: string = window.location.href;
    setPlayRoom(room: PlayRoom) {
        localStorage.setItem(this.tabID + 'currentRoom', JSON.stringify(room));
    }
    setName(name: string) {
        localStorage.setItem(this.tabID + 'playerName', name);
    }
    getName() {
        const name = localStorage.getItem(this.tabID + 'playerName');
        return name ? name : undefined;
    }

    getRoom() {
        const room = localStorage.getItem(this.tabID + 'currentRoom');
        return room ? JSON.parse(room) : undefined;
    }
}
