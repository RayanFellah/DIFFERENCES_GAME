/* eslint-disable max-params */
/* eslint-disable no-underscore-dangle */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { JoinGame } from '@app/interfaces/join-game';
import { GameStateService } from '@app/services/game-state/game-state.service';
import { ImageHttpService } from '@app/services/image-http.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { Sheet } from '@common/sheet';
import { BehaviorSubject } from 'rxjs';
@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent implements OnInit {
    @Input() sheet: Sheet;
    @Input() isConfig: boolean;
    @Output() delete = new EventEmitter<void>();
    @Output() createEvent = new EventEmitter<JoinGame>();
    @Output() joinEvent = new EventEmitter<JoinGame>();
    trustedUrl: SafeUrl;
    shouldNavigate$ = new BehaviorSubject(false);
    playerName: string;
    roomName: string;
    constructor(
        private readonly imageHttp: ImageHttpService,
        private sanitizer: DomSanitizer,
        private router: Router,
        private socketService: SocketClientService,
        private gameStateService: GameStateService,
    ) {
        this.shouldNavigate$.subscribe((shouldNavigate) => {
            if (shouldNavigate) {
                const playerName = window.prompt('What is your name?');
                const validName = !(!playerName || playerName.trim().length === 0 || /^\d+$/.test(playerName));
                if (!validName) return alert("Le nom d'utilisateur ne peut pas être vide, ne peut pas contenir que des chiffres ou des espaces.");
                this.playerName = playerName;
                if (!this.sheet.isJoinable) {
                    this.createSoloGame(playerName);
                }
                this.router.navigate(['/game', this.sheet._id, this.playerName, this.roomName]);
            }
        });
    }
    ngOnInit() {
        if (this.sheet) {
            this.imageHttp.getImage(this.sheet.originalImagePath).subscribe((blob: Blob) => {
                this.trustedUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
            });
        }
    }

    navigate(type: boolean) {
        this.shouldNavigate$.next(type);
    }
    play() {
        if (this.isConfig) {
            this.reinitialize();
            return;
        }
        this.gameStateService.isGameInitialized = true;
        this.navigate(true);
    }

    reinitialize() {
        this.socketService.send('reinitialize', { id: this.sheet._id, title: this.sheet.title });
    }

    create() {
        this.gameStateService.isGameInitialized = true;
        const playerName = window.prompt('What is your name?');
        const validName = !(!playerName || playerName.trim().length === 0 || /^\d+$/.test(playerName));
        if (!validName) return alert("Le nom d'utilisateur ne peut pas être vide, ne peut pas contenir que des chiffres ou des espaces.");
        this.navigate(false);
        this.createEvent.emit({ playerName, sheetId: this.sheet._id });
    }

    join() {
        const playerName = window.prompt('What is your name?');
        const validName = !(!playerName || playerName.trim().length === 0 || /^\d+$/.test(playerName));
        if (!validName) return alert("Le nom d'utilisateur ne peut pas être vide, ne peut pas contenir que des chiffres ou des espaces.");
        const joinGame: JoinGame = { playerName, sheetId: this.sheet._id };
        this.joinEvent.emit(joinGame);
    }

 

    onDelete() {
        this.delete.emit();
        this.socketService.send('sheetDeleted', this.sheet);
    }
    private createSoloGame(playerName: string) {
        const length = 10;
        this.roomName = this.generateRandomId(length);
        const data = {
            name: playerName,
            sheetId: this.sheet._id,
            roomName: this.roomName,
        };
        this.socketService.send('createSoloGame', data);
    }
    private generateRandomId(length: number): string {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;

        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}
