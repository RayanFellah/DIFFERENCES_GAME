/* eslint-disable @typescript-eslint/no-empty-function */
import { TestBed } from '@angular/core/testing';

import { CanvasHelperService } from './canvas-helper.service';

describe('CanvasHelperService', () => {
    let service: CanvasHelperService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: HTMLCanvasElement,
                    useValue: {
                        getContext: () => {
                            return {
                                fillRect: () => {},
                                clearRect: () => {},
                                getImageData: () => {
                                    return {
                                        data: new Array(),
                                    };
                                },
                                putImageData: () => {},
                                createImageData: () => {
                                    return new ImageData(1, 1);
                                },
                                setTransform: () => {},
                                drawImage: () => {},
                                save: () => {},
                                fillText: () => {},
                                restore: () => {},
                                beginPath: () => {},
                                moveTo: () => {},
                                lineTo: () => {},
                                closePath: () => {},
                                stroke: () => {},
                                translate: () => {},
                                scale: () => {},
                                rotate: () => {},
                                arc: () => {},
                                fill: () => {},
                                measureText: () => {
                                    return {
                                        width: 0,
                                    };
                                },
                                transform: () => {},
                                rect: () => {},
                                clip: () => {},
                            };
                        },
                    },
                },
            ],
        });
        service = TestBed.inject(CanvasHelperService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
