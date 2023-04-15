import { Injectable } from '@angular/core';
import { GameEvents } from '@app/interfaces/game-events';

@Injectable({
    providedIn: 'root',
})
export class GameReplayService {
    events: GameEvents[] = [];
}
