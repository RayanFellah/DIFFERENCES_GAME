import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class FileUploaderService {
    private canvasImageSources = new BehaviorSubject<{ left: Subject<File>; right: Subject<File> }>({
        left: new Subject<File>(),
        right: new Subject<File>(),
    });

    setCanvasImage(file: File, canvas: 'left' | 'right') {
        const fileSetter = file;
        const canvasImageSource = this.canvasImageSources.value[canvas];
        canvasImageSource.next(fileSetter);
    }

    getCanvasImageSource(canvas: 'left' | 'right'): Observable<File> {
        return this.canvasImageSources.value[canvas].asObservable();
    }
    getMergedCanvas(canvas: 'left' | 'right'): Observable<File> {
        return this.canvasImageSources.value[canvas].asObservable();
    }
}
