import { Injectable } from '@angular/core';

const FAIL_SOUND_URL = '/assets/Audios/mixkit-click-error-1110.wav';
const SUCCESS_SOUND_URL = 'assets/Audios/mixkit-video-game-mystery-alert-234.wav';
@Injectable({
    providedIn: 'root',
})
export class AudioService {
    private audioElement: HTMLAudioElement;
    constructor() {
        this.audioElement = new Audio();
    }

    load(url: string) {
        this.audioElement.src = url;
        this.audioElement.load();
    }

    playSuccessSound() {
        this.load(SUCCESS_SOUND_URL);
        this.audioElement.play();
    }

    playFailSound() {
        this.load(FAIL_SOUND_URL);
        this.audioElement.play();
    }
}
