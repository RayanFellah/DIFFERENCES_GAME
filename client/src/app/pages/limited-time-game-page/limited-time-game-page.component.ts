import { Component } from '@angular/core';
import { TimeLimitModeService } from '@app/services/time-limit-mode.service';
import { ChatMessage } from '@common/chat-message';
import { Player } from '@common/player';

@Component({
    selector: 'app-limited-time-game-page',
    templateUrl: './limited-time-game-page.component.html',
    styleUrls: ['./limited-time-game-page.component.scss'],
})
export class LimitedTimeGamePageComponent {
    difficulty: string;
    chatMessages: ChatMessage[] = [];
    sheetId: string | null;
    roomName: string | null;
    differences: number;
    person: Player;
    opponent: Player;
    timeLeft: number;
    constructor(public gameLogic: TimeLimitModeService) {
        this.timeLeft = this.gameLogic.timeLimit;
        this.person = this.gameLogic.player;
        this.opponent = this.gameLogic.playRoom.player2;
        this.sheetId = this.gameLogic.sheet;
        this.roomName = this.gameLogic.playRoom.roomName;
        this.differences = this.gameLogic.playRoom.currentDifferences.length;
    }
}
