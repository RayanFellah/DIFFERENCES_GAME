import { TestBed } from '@angular/core/testing';
import { AudioService } from './audio.service';

describe('AudioService', () => {
    let service: AudioService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AudioService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    /*
    describe('load', () => {
        it('should set the audio source and load it', () => {
            const audioElementMock: any = jasmine.createSpyObj('HTMLAudioElement', ['load']);
            spyOn(window, 'Audio').and.returnValue(audioElementMock);

            const url = 'https://example.com/audio.wav';
            service.load(url);

            expect(audioElementMock.src).toBe(url);
            expect(audioElementMock.load).toHaveBeenCalled();
        });
    });
    */

    describe('playSuccessSound', () => {
        it('should load and play the success sound', () => {
            spyOn(service, 'load');
            spyOn(service.audioElement, 'play');
            service.playSuccessSound();

            expect(service.load).toHaveBeenCalledWith('./assets/success-audio.wav');
            expect(service.audioElement.play).toHaveBeenCalled();
        });
    });

    describe('playFailSound', () => {
        it('should load and play the fail sound', () => {
            spyOn(service, 'load');
            spyOn(service.audioElement, 'play');
            service.playFailSound();

            expect(service.load).toHaveBeenCalledWith('./assets/error-audio.wav');
            expect(service.audioElement.play).toHaveBeenCalled();
        });
    });
});
