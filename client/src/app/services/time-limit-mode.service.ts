import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameEvents } from '@common/game-events';
import { PlayRoom } from '@common/play-room';
import { Player } from '@common/player';
import { SocketClientService } from './socket-client/socket-client.service';

@Injectable({
    providedIn: 'root',
})
export class TimeLimitModeService {
    sheet: string;
    player: Player;
    playRoom: PlayRoom;
    timeLimit: number;
    timeBonus: number;
    foundDifferences: number = 0;
    hintsLeft: number = 3;
    clickIgnored = false;

    constructor(private socketService: SocketClientService, private activeRoute: ActivatedRoute) {
        this.socketService.connect();
        const playerName = this.activeRoute.snapshot.paramMap.get('name');
        this.sheet = this.activeRoute.snapshot.paramMap.get('id') as string;
        this.player = {
            name: playerName as string,
            socketId: this.socketService.socket.id,
            differencesFound: 0,
        };
    }

    setConstants(limit: number, bonus: number) {
        this.timeLimit = limit;
        this.timeBonus = bonus;
    }

    useHint() {
        if (this.hintsLeft > 0) {
            this.hintsLeft--;
            return true;
        }
        return false;
    }
    sendClick(event: MouseEvent) {
        if (this.clickIgnored) return;
        const data = {
            playerName: this.player.name,
            x: event.offsetX,
            y: event.offsetY,
            roomName: this.playRoom.roomName,
        };

        this.socketService.send(GameEvents.Click, data);
    }
    createSolo() {
        this.createGame(GameEvents.CreateLimitedTimeSolo);
    }

    createCoop() {
        this.createGame(GameEvents.CreateLimitedTimeCoop);
    }

    joinGame() {
        this.socketService.send(GameEvents.JoinCoop, this.player);
    }

    requestSecondPlayer() {
        const data = {
            player: this.player,
            room: this.playRoom,
        };
        this.socketService.send(GameEvents.RequestSecondPlayer, data);
    }

    handleResponses() {
        this.socketService.on(GameEvents.ClickValidated, () => {
            // this.draw(coords);
            // this.playRoom.sheet = sheet;
            // this.drawNewImages();
        });

        this.socketService.on(GameEvents.CoopRoomCreated, (playRoom: PlayRoom) => {
            this.playRoom = playRoom;
            this.requestSecondPlayer();
        });
    }
    private createGame(event: string) {
        const data = {
            player: this.player,
            sheet: this.sheet,
        };
        this.socketService.send(event, data);
    }
}
