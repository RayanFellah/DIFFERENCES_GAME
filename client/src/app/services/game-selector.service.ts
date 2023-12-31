import { Injectable } from '@angular/core';
import { Sheet } from '@common/sheet';

@Injectable({
    providedIn: 'root',
})
export class GameSelectorService {
    currentGame: Sheet;
    create: boolean;
}
