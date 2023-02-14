import { Injectable } from '@angular/core';

const FAIL_SOUND_URL = './error-audio.wav';
const SUCCESS_SOUND_URL = './success-audio';
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
