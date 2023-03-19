import { Injectable } from '@angular/core';

const FAIL_SOUND_URL = './assets/error-audio.wav';
const SUCCESS_SOUND_URL = './assets/success-audio.wav';
@Injectable({
    providedIn: 'root',
})
export class AudioService {
    public audioElement: HTMLAudioElement;
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
