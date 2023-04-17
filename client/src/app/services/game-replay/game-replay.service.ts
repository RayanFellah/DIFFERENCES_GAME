import { Injectable } from '@angular/core';
import { GameEvents } from '@app/interfaces/game-events';

@Injectable({
    providedIn: 'root',
})
export class GameReplayService {
    events: GameEvents[] = [];
    isLastHint = false;
    private _isReplay = false;
    private _isReplayPaused = false;

    get isReplay() {
        return this._isReplay;
    }
    get isReplayPaused() {
        return this._isReplayPaused;
    }
    set isReplayPaused(isReplayPaused: boolean) {
        this._isReplayPaused = isReplayPaused;
    }
    set isReplay(isReplay: boolean) {
        this._isReplay = isReplay;
    }
}
