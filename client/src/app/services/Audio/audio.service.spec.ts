import { AudioService } from './audio.service';

describe('AudioService', () => {
    let service: AudioService;
    let audioElement: HTMLAudioElement;

    beforeEach(() => {
        service = new AudioService();
        audioElement = service['audioElement'];
        spyOn(audioElement, 'load');
        spyOn(audioElement, 'play');
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should load and play success sound', () => {
        service.playSuccessSound();
        expect(audioElement.src).toBe('./assets/success-audio.wav');
        expect(audioElement.load).toHaveBeenCalled();
        expect(audioElement.play).toHaveBeenCalled();
    });

    it('should load and play fail sound', () => {
        service.playFailSound();
        expect(audioElement.src).toBe('./assets/error-audio.wav');
        expect(audioElement.load).toHaveBeenCalled();
        expect(audioElement.play).toHaveBeenCalled();
    });
});
